import axios from 'axios';

import type { CreateGroupDTO } from '@/dtos/CreateGroupDTO';
import type { GroupInterface } from '@/interfaces/GroupInterface';
import type { GroupMemberInterface } from '@/interfaces/GroupMemberInterface';
import type { MemberStatusDraft } from '@/types/MemberStatusDraft';
import type { NameDraft } from '@/types/NameDraft';
import type { Nullable } from '@/types/Nullable';
import type { RegisterGroupDTO } from '@/dtos/RegisterGroupDTO';
import type { UpdateGroupDTO } from '@/dtos/UpdateGroupDTO';
import { CommitteeService } from '@/services/CommitteeService';
import { DomainError } from '@/utils/DomainError';
import { ENVIRONMENT } from '@/constants/environment';
import { MemberStatusService } from '@/services/MemberStatusService';
import { UserService } from '@/services/UserService';
import { clampPercentage } from '@/utils/clampPercentage';

export interface UpdateGroupDetailsDTO {
  name: string;
  committees: NameDraft[];
  statuses: MemberStatusDraft[];
}

interface NamedEntity {
  id: number;
  name: string;
}

interface ReconcileHandlers {
  create: (name: string) => Promise<unknown>;
  rename: (id: number, name: string) => Promise<unknown>;
  remove: (id: number) => Promise<unknown>;
}

const GROUPS_URL = `${ENVIRONMENT.API_URL}/groups`;
const GROUP_MEMBERS_URL = `${ENVIRONMENT.API_URL}/group-members`;

export class GroupService {
  public static async getGroups(): Promise<GroupInterface[]> {
    const { data } = await axios.get<GroupInterface[]>(GROUPS_URL);
    return data;
  }

  public static async getGroupById(id: number): Promise<Nullable<GroupInterface>> {
    try {
      const { data } = await axios.get<GroupInterface>(`${GROUPS_URL}/${id}`);
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  public static async getMemberCount(groupId: number): Promise<number> {
    const { data } = await axios.get<GroupMemberInterface[]>(GROUP_MEMBERS_URL, {
      params: { groupId },
    });
    return data.length;
  }

  public static async groupNameExists(
    name: string,
    exceptId: Nullable<number> = null,
  ): Promise<boolean> {
    const normalized = name.trim().toLowerCase();
    const groups = await GroupService.getGroups();
    return groups.some(
      (group: GroupInterface) => group.name.toLowerCase() === normalized && group.id !== exceptId,
    );
  }

  public static async createGroup(dto: CreateGroupDTO): Promise<GroupInterface> {
    const { data } = await axios.post<GroupInterface>(GROUPS_URL, { name: dto.name.trim() });
    return data;
  }

  public static async registerGroup(dto: RegisterGroupDTO): Promise<GroupInterface> {
    if (await GroupService.groupNameExists(dto.name)) {
      throw new DomainError('GROUP_NAME_TAKEN');
    }

    const group = await GroupService.createGroup({ name: dto.name });

    try {
      await UserService.createUser({
        username: dto.boardUsername,
        password: dto.boardPassword,
        groupId: group.id,
      });
    } catch (error: unknown) {
      // Rollback: el usuario no se creó, borramos el grupo recién hecho.
      await GroupService.deleteGroup(group.id).catch(() => undefined);
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        throw new DomainError('USERNAME_TAKEN');
      }
      throw error;
    }

    await GroupService.applyCommittees(
      group.id,
      dto.committeeNames.map((name: string) => ({ id: null, name })),
    );
    await GroupService.applyStatuses(
      group.id,
      dto.statuses.map((status) => ({
        id: null,
        name: status.name,
        percentage: status.percentage,
      })),
    );

    return group;
  }

  public static async updateGroup(id: number, dto: UpdateGroupDTO): Promise<GroupInterface> {
    const nextName = dto.name?.trim();
    if (nextName !== undefined && (await GroupService.groupNameExists(nextName, id))) {
      throw new DomainError('GROUP_NAME_TAKEN');
    }

    try {
      const { data } = await axios.patch<GroupInterface>(
        `${GROUPS_URL}/${id}`,
        nextName === undefined ? {} : { name: nextName },
      );
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new DomainError('GROUP_NOT_FOUND');
      }
      throw error;
    }
  }

  public static async updateGroupDetails(
    id: number,
    dto: UpdateGroupDetailsDTO,
  ): Promise<GroupInterface> {
    const updated = await GroupService.updateGroup(id, { name: dto.name });
    await GroupService.applyCommittees(id, dto.committees);
    await GroupService.applyStatuses(id, dto.statuses);
    return updated;
  }

  // El backend borra en cascada comités, estados, actividades, permanencias, la
  // cuenta de junta y los miembros exclusivos del grupo.
  public static async deleteGroup(id: number): Promise<void> {
    try {
      await axios.delete(`${GROUPS_URL}/${id}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new DomainError('GROUP_NOT_FOUND');
      }
      throw error;
    }
  }

  private static async applyCommittees(groupId: number, drafts: NameDraft[]): Promise<void> {
    const existing = await CommitteeService.getCommitteesByGroupId(groupId);
    await GroupService.reconcile(existing, drafts, {
      create: (name: string) => CommitteeService.createCommittee({ name, groupId }),
      rename: (id: number, name: string) => CommitteeService.updateCommittee(id, { name }),
      // El backend cascadea actividades y la relación M:N comité-miembro.
      remove: (id: number) => CommitteeService.deleteCommittee(id),
    });
  }

  private static async applyStatuses(groupId: number, drafts: MemberStatusDraft[]): Promise<void> {
    const cleaned = drafts
      .map((draft: MemberStatusDraft) => ({
        id: draft.id,
        name: draft.name.trim(),
        percentage: clampPercentage(draft.percentage),
      }))
      .filter((draft) => draft.name.length > 0);

    const keptIds = cleaned
      .map((draft) => draft.id)
      .filter((id: Nullable<number>): id is number => id !== null);

    // Se crean primero los estados nuevos para tener un estado de respaldo al
    // que reasignar los miembros de un estado eliminado.
    const survivingIds = [...keptIds];
    for (const draft of cleaned.filter((draft) => draft.id === null)) {
      const status = await MemberStatusService.createMemberStatus({
        name: draft.name,
        groupId,
        target: draft.percentage,
      });
      survivingIds.push(status.id);
    }

    const fallbackStatusId = survivingIds[0] ?? null;
    const existing = await MemberStatusService.getMemberStatusesByGroupId(groupId);
    for (const status of existing.filter((status) => !keptIds.includes(status.id))) {
      if (fallbackStatusId !== null) {
        await GroupService.reassignStatus(groupId, status.id, fallbackStatusId);
      }
      await MemberStatusService.deleteMemberStatus(status.id);
    }

    for (const draft of cleaned.filter(
      (draft): draft is typeof draft & { id: number } => draft.id !== null,
    )) {
      await MemberStatusService.updateMemberStatus(draft.id, {
        name: draft.name,
        target: draft.percentage,
      });
    }
  }

  // El backend no permite borrar un estado con miembros asignados (FK sin
  // cascada), así que hay que moverlos a otro estado primero.
  private static async reassignStatus(
    groupId: number,
    fromStatusId: number,
    toStatusId: number,
  ): Promise<void> {
    const { data: links } = await axios.get<GroupMemberInterface[]>(GROUP_MEMBERS_URL, {
      params: { groupId },
    });
    for (const link of links.filter((link) => link.memberStatusId === fromStatusId)) {
      await axios.patch(`${GROUP_MEMBERS_URL}/${link.id}`, { memberStatusId: toStatusId });
    }
  }

  private static async reconcile(
    existing: NamedEntity[],
    drafts: NameDraft[],
    handlers: ReconcileHandlers,
  ): Promise<void> {
    const cleaned = drafts
      .map((draft: NameDraft) => ({ id: draft.id, name: draft.name.trim() }))
      .filter((draft: NameDraft) => draft.name.length > 0);

    const keptIds = cleaned
      .map((draft: NameDraft) => draft.id)
      .filter((id: Nullable<number>): id is number => id !== null);

    for (const entity of existing.filter((entity: NamedEntity) => !keptIds.includes(entity.id))) {
      await handlers.remove(entity.id);
    }

    for (const draft of cleaned) {
      if (draft.id === null) {
        await handlers.create(draft.name);
      } else {
        await handlers.rename(draft.id, draft.name);
      }
    }
  }
}

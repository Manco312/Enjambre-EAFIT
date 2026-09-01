import type { CreateGroupDTO } from '@/dtos/CreateGroupDTO';
import type { GroupInterface } from '@/interfaces/GroupInterface';
import type { NameDraft } from '@/types/NameDraft';
import type { Nullable } from '@/types/Nullable';
import type { RegisterGroupDTO } from '@/dtos/RegisterGroupDTO';
import type { UpdateGroupDTO } from '@/dtos/UpdateGroupDTO';
import { CommitteeService } from '@/services/CommitteeService';
import { DomainError } from '@/utils/DomainError';
import { MemberService } from '@/services/MemberService';
import { MemberStatusService } from '@/services/MemberStatusService';
import { USER_ROLES } from '@/constants/roles';
import { UserService } from '@/services/UserService';
import { generateId } from '@/utils/generateId';
import { useGroupStore } from '@/stores/groupstore';

export interface UpdateGroupDetailsDTO {
  name: string;
  committees: NameDraft[];
  statuses: NameDraft[];
}

interface NamedEntity {
  id: number;
  name: string;
}

interface ReconcileHandlers {
  create: (name: string) => void;
  rename: (id: number, name: string) => void;
  remove: (id: number) => void;
}

export class GroupService {
  public static getGroups(): GroupInterface[] {
    return useGroupStore().groups;
  }

  public static getGroupById(id: number): Nullable<GroupInterface> {
    return useGroupStore().groups.find((group: GroupInterface) => group.id === id) ?? null;
  }

  public static groupNameExists(name: string, exceptId: Nullable<number> = null): boolean {
    const normalized = name.trim().toLowerCase();
    return useGroupStore().groups.some(
      (group: GroupInterface) => group.name.toLowerCase() === normalized && group.id !== exceptId,
    );
  }

  public static createGroup(dto: CreateGroupDTO): GroupInterface {
    const store = useGroupStore();
    const group: GroupInterface = {
      id: generateId(store.groups),
      name: dto.name.trim(),
    };
    store.addGroup(group);
    return group;
  }

  public static registerGroup(dto: RegisterGroupDTO): GroupInterface {
    if (GroupService.groupNameExists(dto.name)) {
      throw new DomainError('GROUP_NAME_TAKEN');
    }

    if (UserService.usernameExists(dto.boardUsername)) {
      throw new DomainError('USERNAME_TAKEN');
    }

    const group = GroupService.createGroup({ name: dto.name });

    GroupService.applyCommittees(
      group.id,
      dto.committeeNames.map((name: string) => ({ id: null, name })),
    );
    GroupService.applyStatuses(
      group.id,
      dto.statusNames.map((name: string) => ({ id: null, name })),
    );

    UserService.createUser({
      username: dto.boardUsername,
      password: dto.boardPassword,
      role: USER_ROLES.BOARD,
      groupId: group.id,
    });

    return group;
  }

  public static updateGroup(id: number, dto: UpdateGroupDTO): GroupInterface {
    const current = GroupService.getGroupById(id);
    if (current === null) {
      throw new DomainError('GROUP_NOT_FOUND');
    }

    const nextName = (dto.name ?? current.name).trim();
    if (GroupService.groupNameExists(nextName, id)) {
      throw new DomainError('GROUP_NAME_TAKEN');
    }

    const updated: GroupInterface = { ...current, ...dto, name: nextName };
    useGroupStore().updateGroup(updated);
    return updated;
  }

  public static updateGroupDetails(id: number, dto: UpdateGroupDetailsDTO): GroupInterface {
    const updated = GroupService.updateGroup(id, { name: dto.name });
    GroupService.applyCommittees(id, dto.committees);
    GroupService.applyStatuses(id, dto.statuses);
    return updated;
  }

  public static deleteGroup(id: number): void {
    const current = GroupService.getGroupById(id);
    if (current === null) {
      throw new DomainError('GROUP_NOT_FOUND');
    }

    MemberService.deleteMembersByGroupId(id);
    MemberStatusService.deleteMemberStatusesByGroupId(id);
    CommitteeService.deleteCommitteesByGroupId(id);
    UserService.deleteBoardUserByGroupId(id);
    useGroupStore().removeGroup(id);
  }

  private static applyCommittees(groupId: number, drafts: NameDraft[]): void {
    GroupService.reconcile(CommitteeService.getCommitteesByGroupId(groupId), drafts, {
      create: (name: string) => {
        CommitteeService.createCommittee({ name, groupId });
      },
      rename: (id: number, name: string) => {
        CommitteeService.updateCommittee(id, { name });
      },
      remove: (id: number) => {
        CommitteeService.deleteCommittee(id);
      },
    });
  }

  private static applyStatuses(groupId: number, drafts: NameDraft[]): void {
    GroupService.reconcile(MemberStatusService.getMemberStatusesByGroupId(groupId), drafts, {
      create: (name: string) => {
        MemberStatusService.createMemberStatus({ name, groupId });
      },
      rename: (id: number, name: string) => {
        MemberStatusService.updateMemberStatus(id, { name });
      },
      remove: (id: number) => {
        MemberStatusService.deleteMemberStatus(id);
      },
    });
  }

  private static reconcile(
    existing: NamedEntity[],
    drafts: NameDraft[],
    handlers: ReconcileHandlers,
  ): void {
    const cleaned = drafts
      .map((draft: NameDraft) => ({ id: draft.id, name: draft.name.trim() }))
      .filter((draft: NameDraft) => draft.name.length > 0);

    const keptIds = cleaned
      .map((draft: NameDraft) => draft.id)
      .filter((id: Nullable<number>): id is number => id !== null);

    existing
      .filter((entity: NamedEntity) => !keptIds.includes(entity.id))
      .forEach((entity: NamedEntity) => {
        handlers.remove(entity.id);
      });

    cleaned.forEach((draft: NameDraft) => {
      if (draft.id === null) {
        handlers.create(draft.name);
      } else {
        handlers.rename(draft.id, draft.name);
      }
    });
  }
}

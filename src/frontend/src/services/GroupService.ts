import type { CommitteeDraft } from '@/types/CommitteeDraft';
import type { CommitteeInterface } from '@/interfaces/CommitteeInterface';
import type { CreateGroupDTO } from '@/dtos/CreateGroupDTO';
import type { GroupInterface } from '@/interfaces/GroupInterface';
import type { Nullable } from '@/types/Nullable';
import type { RegisterGroupDTO } from '@/dtos/RegisterGroupDTO';
import type { UpdateGroupDTO } from '@/dtos/UpdateGroupDTO';
import { CommitteeService } from '@/services/CommitteeService';
import { DomainError } from '@/utils/DomainError';
import { USER_ROLES } from '@/constants/roles';
import { UserService } from '@/services/UserService';
import { generateId } from '@/utils/generateId';
import { useGroupStore } from '@/stores/groupstore';

export interface UpdateGroupWithCommitteesDTO {
  name: string;
  committees: CommitteeDraft[];
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

    GroupService.replaceCommittees(
      group.id,
      dto.committeeNames.map((name: string) => ({ id: null, name })),
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

  public static updateGroupWithCommittees(
    id: number,
    dto: UpdateGroupWithCommitteesDTO,
  ): GroupInterface {
    const updated = GroupService.updateGroup(id, { name: dto.name });
    GroupService.replaceCommittees(id, dto.committees);
    return updated;
  }

  public static deleteGroup(id: number): void {
    const current = GroupService.getGroupById(id);
    if (current === null) {
      throw new DomainError('GROUP_NOT_FOUND');
    }

    CommitteeService.deleteCommitteesByGroupId(id);
    UserService.deleteBoardUserByGroupId(id);
    useGroupStore().removeGroup(id);
  }

  private static replaceCommittees(groupId: number, drafts: CommitteeDraft[]): void {
    const cleaned = drafts
      .map((draft: CommitteeDraft) => ({ id: draft.id, name: draft.name.trim() }))
      .filter((draft: CommitteeDraft) => draft.name.length > 0);

    const keptIds = cleaned
      .map((draft: CommitteeDraft) => draft.id)
      .filter((id: Nullable<number>): id is number => id !== null);

    CommitteeService.getCommitteesByGroupId(groupId)
      .filter((committee: CommitteeInterface) => !keptIds.includes(committee.id))
      .forEach((committee: CommitteeInterface) => {
        CommitteeService.deleteCommittee(committee.id);
      });

    cleaned.forEach((draft: CommitteeDraft) => {
      if (draft.id === null) {
        CommitteeService.createCommittee({ name: draft.name, groupId });
      } else {
        CommitteeService.updateCommittee(draft.id, { name: draft.name });
      }
    });
  }
}

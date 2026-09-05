import type { CreateGroupMemberDTO } from '@/dtos/CreateGroupMemberDTO';
import type { GroupMemberInterface } from '@/interfaces/GroupMemberInterface';
import type { Nullable } from '@/types/Nullable';
import type { UpdateGroupMemberDTO } from '@/dtos/UpdateGroupMemberDTO';
import { generateId } from '@/utils/generateId';
import { useGroupMemberStore } from '@/stores/groupmemberstore';

export class GroupMemberService {
  public static getByGroupId(groupId: number): GroupMemberInterface[] {
    return useGroupMemberStore().groupMembers.filter(
      (groupMember: GroupMemberInterface) => groupMember.groupId === groupId,
    );
  }

  public static getByMemberId(memberId: number): GroupMemberInterface[] {
    return useGroupMemberStore().groupMembers.filter(
      (groupMember: GroupMemberInterface) => groupMember.memberId === memberId,
    );
  }

  public static getByMemberAndGroup(
    memberId: number,
    groupId: number,
  ): Nullable<GroupMemberInterface> {
    return (
      useGroupMemberStore().groupMembers.find(
        (groupMember: GroupMemberInterface) =>
          groupMember.memberId === memberId && groupMember.groupId === groupId,
      ) ?? null
    );
  }

  public static create(dto: CreateGroupMemberDTO): GroupMemberInterface {
    const store = useGroupMemberStore();
    const groupMember: GroupMemberInterface = {
      id: generateId(store.groupMembers),
      memberId: dto.memberId,
      groupId: dto.groupId,
      memberStatusId: dto.memberStatusId,
    };
    store.addGroupMember(groupMember);
    return groupMember;
  }

  public static update(id: number, dto: UpdateGroupMemberDTO): GroupMemberInterface {
    const store = useGroupMemberStore();
    const current = store.groupMembers.find((item: GroupMemberInterface) => item.id === id);
    if (current === undefined) {
      throw new Error('GROUP_MEMBER_NOT_FOUND');
    }

    const updated: GroupMemberInterface = { ...current, ...dto };
    store.updateGroupMember(updated);
    return updated;
  }

  public static updateStatus(
    memberId: number,
    groupId: number,
    memberStatusId: number,
  ): Nullable<GroupMemberInterface> {
    const existing = GroupMemberService.getByMemberAndGroup(memberId, groupId);
    if (existing === null) {
      return null;
    }
    return GroupMemberService.update(existing.id, { memberStatusId });
  }

  public static reassignStatus(oldStatusId: number, fallbackStatusId: number): void {
    const store = useGroupMemberStore();
    store.groupMembers
      .filter((groupMember: GroupMemberInterface) => groupMember.memberStatusId === oldStatusId)
      .forEach((groupMember: GroupMemberInterface) => {
        GroupMemberService.update(groupMember.id, { memberStatusId: fallbackStatusId });
      });
  }

  public static deleteById(id: number): void {
    useGroupMemberStore().removeGroupMember(id);
  }

  public static deleteByMemberId(memberId: number): void {
    GroupMemberService.getByMemberId(memberId).forEach((groupMember: GroupMemberInterface) => {
      GroupMemberService.deleteById(groupMember.id);
    });
  }

  public static deleteByGroupId(groupId: number): void {
    GroupMemberService.getByGroupId(groupId).forEach((groupMember: GroupMemberInterface) => {
      GroupMemberService.deleteById(groupMember.id);
    });
  }
}

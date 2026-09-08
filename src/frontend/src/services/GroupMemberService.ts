import axios from 'axios';

import type { CreateGroupMemberDTO } from '@/dtos/CreateGroupMemberDTO';
import type { GroupMemberInterface } from '@/interfaces/GroupMemberInterface';
import type { Nullable } from '@/types/Nullable';
import type { UpdateGroupMemberDTO } from '@/dtos/UpdateGroupMemberDTO';
import { ENVIRONMENT } from '@/constants/environment';

const GROUP_MEMBERS_URL = `${ENVIRONMENT.API_URL}/group-members`;

export class GroupMemberService {
  public static async getByGroupId(groupId: number): Promise<GroupMemberInterface[]> {
    const { data } = await axios.get<GroupMemberInterface[]>(GROUP_MEMBERS_URL, {
      params: { groupId },
    });
    return data;
  }

  public static async getByMemberId(memberId: number): Promise<GroupMemberInterface[]> {
    const { data } = await axios.get<GroupMemberInterface[]>(GROUP_MEMBERS_URL, {
      params: { memberId },
    });
    return data;
  }

  public static async getByMemberAndGroup(
    memberId: number,
    groupId: number,
  ): Promise<Nullable<GroupMemberInterface>> {
    const { data } = await axios.get<GroupMemberInterface[]>(GROUP_MEMBERS_URL, {
      params: { groupId, memberId },
    });
    return data.find((groupMember) => groupMember.memberId === memberId) ?? null;
  }

  public static async create(dto: CreateGroupMemberDTO): Promise<GroupMemberInterface> {
    const { data } = await axios.post<GroupMemberInterface>(GROUP_MEMBERS_URL, dto);
    return data;
  }

  public static async update(id: number, dto: UpdateGroupMemberDTO): Promise<GroupMemberInterface> {
    const { data } = await axios.patch<GroupMemberInterface>(`${GROUP_MEMBERS_URL}/${id}`, dto);
    return data;
  }

  public static async updateStatus(
    memberId: number,
    groupId: number,
    memberStatusId: number,
  ): Promise<Nullable<GroupMemberInterface>> {
    const existing = await GroupMemberService.getByMemberAndGroup(memberId, groupId);
    if (existing === null) {
      return null;
    }
    return GroupMemberService.update(existing.id, { memberStatusId });
  }
}

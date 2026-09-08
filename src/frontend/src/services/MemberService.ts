import axios from 'axios';

import type { CommitteeInterface } from '@/interfaces/CommitteeInterface';
import type { CreateMemberDTO } from '@/dtos/CreateMemberDTO';
import type { MemberInterface } from '@/interfaces/MemberInterface';
import type { MemberStatusInterface } from '@/interfaces/MemberStatusInterface';
import type { Nullable } from '@/types/Nullable';
import type { UpdateMemberDTO } from '@/dtos/UpdateMemberDTO';
import { ENVIRONMENT } from '@/constants/environment';
import { GroupMemberService } from '@/services/GroupMemberService';

export type MemberWithMembership = MemberInterface & { memberStatusId: number };

export interface MemberLookups {
  committees: CommitteeInterface[];
  statuses: MemberStatusInterface[];
}

export interface MemberFilterCriteria {
  search: string;
  columnFilters: Partial<Record<string, string>>;
}

interface GroupMemberWithMember {
  id: number;
  memberId: number;
  groupId: number;
  memberStatusId: number;
  member: MemberInterface;
}

const MEMBERS_URL = `${ENVIRONMENT.API_URL}/members`;
const GROUP_MEMBERS_URL = `${ENVIRONMENT.API_URL}/group-members`;

export class MemberService {
  public static async getMembers(): Promise<MemberInterface[]> {
    const { data } = await axios.get<MemberInterface[]>(MEMBERS_URL);
    return data;
  }

  public static async getMembersByGroupId(groupId: number): Promise<MemberWithMembership[]> {
    const { data } = await axios.get<GroupMemberWithMember[]>(GROUP_MEMBERS_URL, {
      params: { groupId },
    });
    return data.map((groupMember) => ({
      ...groupMember.member,
      memberStatusId: groupMember.memberStatusId,
    }));
  }

  public static async getMemberById(id: number): Promise<Nullable<MemberInterface>> {
    try {
      const { data } = await axios.get<MemberInterface>(`${MEMBERS_URL}/${id}`);
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  public static async createMember(dto: CreateMemberDTO): Promise<MemberWithMembership> {
    const { data } = await axios.post<MemberInterface>(MEMBERS_URL, dto);
    return { ...data, memberStatusId: dto.memberStatusId };
  }

  public static async updateMember(id: number, dto: UpdateMemberDTO): Promise<MemberInterface> {
    const { data } = await axios.patch<MemberInterface>(`${MEMBERS_URL}/${id}`, dto);
    return data;
  }

  public static async updateMemberStatus(
    memberId: number,
    groupId: number,
    memberStatusId: number,
  ): Promise<void> {
    await GroupMemberService.updateStatus(memberId, groupId, memberStatusId);
  }

  public static async deleteMember(id: number): Promise<void> {
    await axios.delete(`${MEMBERS_URL}/${id}`);
  }

  public static getDisplayName(member: MemberInterface): string {
    return member.fullName || member.email || 'Sin nombre';
  }

  public static getCommitteeNames(
    member: MemberInterface,
    committees: CommitteeInterface[],
  ): string[] {
    return member.committeeIds
      .map((id: number) => committees.find((committee) => committee.id === id)?.name)
      .filter((name): name is string => name !== undefined);
  }

  public static getStatusName(memberStatusId: number, statuses: MemberStatusInterface[]): string {
    return statuses.find((status) => status.id === memberStatusId)?.name ?? '—';
  }

  public static filterMembers(
    members: MemberWithMembership[],
    criteria: MemberFilterCriteria,
    lookups: MemberLookups,
  ): MemberWithMembership[] {
    const search = criteria.search.trim().toLowerCase();

    return members.filter((member: MemberWithMembership) => {
      if (search.length > 0 && !MemberService.memberMatchesText(member, search, lookups)) {
        return false;
      }

      return Object.entries(criteria.columnFilters).every(
        ([key, rawValue]: [string, string | undefined]) => {
          const value = (rawValue ?? '').trim().toLowerCase();
          if (value.length === 0) {
            return true;
          }
          return MemberService.fieldToText(member, key, lookups).toLowerCase().includes(value);
        },
      );
    });
  }

  public static fieldToText(
    member: MemberWithMembership | MemberInterface,
    key: string,
    lookups: MemberLookups,
  ): string {
    if (key === 'memberStatusId') {
      const memberStatusId = (member as MemberWithMembership).memberStatusId;
      return memberStatusId === undefined
        ? ''
        : MemberService.getStatusName(memberStatusId, lookups.statuses);
    }
    if (key === 'committeeIds') {
      return MemberService.getCommitteeNames(member, lookups.committees).join('; ');
    }
    if (key === 'idEpik') {
      return String(member.idEpik);
    }

    const value = (member as unknown as Record<string, unknown>)[key];
    if (Array.isArray(value)) {
      return value.join('; ');
    }
    return String(value ?? '');
  }

  private static memberMatchesText(
    member: MemberWithMembership,
    loweredSearch: string,
    lookups: MemberLookups,
  ): boolean {
    const keys = [
      'email',
      'fullName',
      'idEpik',
      'documentNumber',
      'program',
      'secondProgram',
      'memberStatusId',
      'committeeIds',
    ];
    return keys.some((key) =>
      MemberService.fieldToText(member, key, lookups).toLowerCase().includes(loweredSearch),
    );
  }
}

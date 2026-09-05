import type { CreateMemberDTO } from '@/dtos/CreateMemberDTO';
import type { MemberInterface } from '@/interfaces/MemberInterface';
import type { Nullable } from '@/types/Nullable';
import type { UpdateMemberDTO } from '@/dtos/UpdateMemberDTO';
import { CommitteeService } from '@/services/CommitteeService';
import { DOCUMENT_TYPES } from '@/constants/documentTypes';
import { GroupMemberService } from '@/services/GroupMemberService';
import { MemberStatusService } from '@/services/MemberStatusService';
import { PermanenceService } from '@/services/PermanenceService';
import { generateId } from '@/utils/generateId';
import { useMemberStore } from '@/stores/memberstore';

export type MemberWithMembership = MemberInterface & { memberStatusId: number };

export interface MemberFilterCriteria {
  search: string;
  columnFilters: Partial<Record<string, string>>;
}

export class MemberService {
  public static getMembers(): MemberInterface[] {
    return useMemberStore().members;
  }

  public static getMembersByGroupId(groupId: number): MemberWithMembership[] {
    return GroupMemberService.getByGroupId(groupId)
      .map((groupMember) => {
        const member = MemberService.getMemberById(groupMember.memberId);
        return member === null ? null : { ...member, memberStatusId: groupMember.memberStatusId };
      })
      .filter((member): member is MemberWithMembership => member !== null);
  }

  public static getMemberById(id: number): Nullable<MemberInterface> {
    return useMemberStore().members.find((member: MemberInterface) => member.id === id) ?? null;
  }

  public static createMember(dto: CreateMemberDTO): MemberWithMembership {
    const store = useMemberStore();
    const { groupId, memberStatusId, ...memberFields } = dto;
    const member: MemberInterface = { id: generateId(store.members), ...memberFields };
    store.addMember(member);
    GroupMemberService.create({ memberId: member.id, groupId, memberStatusId });
    return { ...member, memberStatusId };
  }

  public static createBlankMember(groupId: number, memberStatusId: number): MemberWithMembership {
    return MemberService.createMember({
      groupId,
      memberStatusId,
      idEpik: 0,
      fullName: '',
      documentType: DOCUMENT_TYPES.CC,
      documentNumber: '',
      email: '',
      phone: '',
      program: '',
      secondProgram: '',
      committeeIds: [],
    });
  }

  public static updateMember(id: number, dto: UpdateMemberDTO): MemberInterface {
    const current = MemberService.getMemberById(id);
    if (current === null) {
      throw new Error('MEMBER_NOT_FOUND');
    }

    const updated: MemberInterface = { ...current, ...dto };
    useMemberStore().updateMember(updated);
    return updated;
  }

  public static updateMemberStatus(
    memberId: number,
    groupId: number,
    memberStatusId: number,
  ): void {
    GroupMemberService.updateStatus(memberId, groupId, memberStatusId);
  }

  public static deleteMember(id: number): void {
    PermanenceService.deleteByMemberId(id);
    GroupMemberService.deleteByMemberId(id);
    useMemberStore().removeMember(id);
  }

  public static deleteMembersByGroupId(groupId: number): void {
    MemberService.getMembersByGroupId(groupId).forEach((member: MemberWithMembership) => {
      MemberService.deleteMember(member.id);
    });
  }

  public static removeCommitteeFromMembers(committeeId: number): void {
    useMemberStore().members.forEach((member: MemberInterface) => {
      if (member.committeeIds.includes(committeeId)) {
        MemberService.updateMember(member.id, {
          committeeIds: member.committeeIds.filter((id: number) => id !== committeeId),
        });
      }
    });
  }

  public static getDisplayName(member: MemberInterface): string {
    return member.fullName || member.email || 'Sin nombre';
  }

  public static getCommitteeNames(member: MemberInterface): string[] {
    return member.committeeIds
      .map((id: number) => CommitteeService.getCommitteeById(id)?.name)
      .filter((name): name is string => name !== undefined && name !== null);
  }

  public static getStatusName(memberStatusId: number): string {
    return MemberStatusService.getMemberStatusById(memberStatusId)?.name ?? '—';
  }

  public static filterMembers(
    members: MemberWithMembership[],
    criteria: MemberFilterCriteria,
  ): MemberWithMembership[] {
    const search = criteria.search.trim().toLowerCase();

    return members.filter((member: MemberWithMembership) => {
      if (search.length > 0 && !MemberService.memberMatchesText(member, search)) {
        return false;
      }

      return Object.entries(criteria.columnFilters).every(
        ([key, rawValue]: [string, string | undefined]) => {
          const value = (rawValue ?? '').trim().toLowerCase();
          if (value.length === 0) {
            return true;
          }
          return MemberService.fieldToText(member, key).toLowerCase().includes(value);
        },
      );
    });
  }

  public static fieldToText(member: MemberWithMembership | MemberInterface, key: string): string {
    if (key === 'memberStatusId') {
      const memberStatusId = (member as MemberWithMembership).memberStatusId;
      return memberStatusId === undefined ? '' : MemberService.getStatusName(memberStatusId);
    }
    if (key === 'committeeIds') {
      return MemberService.getCommitteeNames(member).join('; ');
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

  private static memberMatchesText(member: MemberWithMembership, loweredSearch: string): boolean {
    return (
      MemberService.fieldToText(member, 'email').toLowerCase().includes(loweredSearch) ||
      MemberService.fieldToText(member, 'fullName').toLowerCase().includes(loweredSearch) ||
      MemberService.fieldToText(member, 'idEpik').toLowerCase().includes(loweredSearch) ||
      MemberService.fieldToText(member, 'documentNumber').toLowerCase().includes(loweredSearch) ||
      MemberService.fieldToText(member, 'program').toLowerCase().includes(loweredSearch) ||
      MemberService.fieldToText(member, 'secondProgram').toLowerCase().includes(loweredSearch) ||
      MemberService.fieldToText(member, 'memberStatusId').toLowerCase().includes(loweredSearch) ||
      MemberService.fieldToText(member, 'committeeIds').toLowerCase().includes(loweredSearch)
    );
  }
}

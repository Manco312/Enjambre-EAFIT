import type { CreateMemberDTO } from '@/dtos/CreateMemberDTO';
import type { MemberInterface } from '@/interfaces/MemberInterface';
import type { Nullable } from '@/types/Nullable';
import type { UpdateMemberDTO } from '@/dtos/UpdateMemberDTO';
import { DOCUMENT_TYPES } from '@/constants/documentTypes';
import { generateId } from '@/utils/generateId';
import { useMemberStore } from '@/stores/memberstore';

export interface MemberFilterCriteria {
  search: string;
  columnFilters: Partial<Record<keyof MemberInterface, string>>;
}

export class MemberService {
  public static getMembers(): MemberInterface[] {
    return useMemberStore().members;
  }

  public static getMembersByGroupId(groupId: number): MemberInterface[] {
    return useMemberStore().members.filter((member: MemberInterface) => member.groupId === groupId);
  }

  public static getMemberById(id: number): Nullable<MemberInterface> {
    return useMemberStore().members.find((member: MemberInterface) => member.id === id) ?? null;
  }

  public static createMember(dto: CreateMemberDTO): MemberInterface {
    const store = useMemberStore();
    const member: MemberInterface = { id: generateId(store.members), ...dto };
    store.addMember(member);
    return member;
  }

  public static createBlankMember(groupId: number): MemberInterface {
    return MemberService.createMember({
      groupId,
      email: '',
      name: '',
      epikId: '',
      fullName: '',
      documentType: DOCUMENT_TYPES.CC,
      documentNumber: '',
      emailUppercase: '',
      phone: '',
      program: '',
      secondProgram: '',
      membershipStatus: [],
      areas: [],
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

  public static deleteMember(id: number): void {
    useMemberStore().removeMember(id);
  }

  public static deleteMembersByGroupId(groupId: number): void {
    MemberService.getMembersByGroupId(groupId).forEach((member: MemberInterface) => {
      MemberService.deleteMember(member.id);
    });
  }

  public static filterMembers(
    members: MemberInterface[],
    criteria: MemberFilterCriteria,
  ): MemberInterface[] {
    const search = criteria.search.trim().toLowerCase();

    return members.filter((member: MemberInterface) => {
      if (search.length > 0 && !MemberService.memberMatchesText(member, search)) {
        return false;
      }

      return Object.entries(criteria.columnFilters).every(
        ([key, rawValue]: [string, string | undefined]) => {
          const value = (rawValue ?? '').trim().toLowerCase();
          if (value.length === 0) {
            return true;
          }
          return MemberService.fieldToText(member, key as keyof MemberInterface)
            .toLowerCase()
            .includes(value);
        },
      );
    });
  }

  public static fieldToText(member: MemberInterface, key: keyof MemberInterface): string {
    const value = member[key];
    if (Array.isArray(value)) {
      return value.join('; ');
    }
    return String(value);
  }

  private static memberMatchesText(member: MemberInterface, loweredSearch: string): boolean {
    return (
      MemberService.fieldToText(member, 'email').toLowerCase().includes(loweredSearch) ||
      MemberService.fieldToText(member, 'name').toLowerCase().includes(loweredSearch) ||
      MemberService.fieldToText(member, 'fullName').toLowerCase().includes(loweredSearch) ||
      MemberService.fieldToText(member, 'epikId').toLowerCase().includes(loweredSearch) ||
      MemberService.fieldToText(member, 'documentNumber').toLowerCase().includes(loweredSearch) ||
      MemberService.fieldToText(member, 'program').toLowerCase().includes(loweredSearch) ||
      MemberService.fieldToText(member, 'secondProgram').toLowerCase().includes(loweredSearch) ||
      MemberService.fieldToText(member, 'membershipStatus').toLowerCase().includes(loweredSearch) ||
      MemberService.fieldToText(member, 'areas').toLowerCase().includes(loweredSearch)
    );
  }
}

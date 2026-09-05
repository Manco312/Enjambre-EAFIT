import type { CreateMemberStatusDTO } from '@/dtos/CreateMemberStatusDTO';
import type { MemberStatusInterface } from '@/interfaces/MemberStatusInterface';
import type { Nullable } from '@/types/Nullable';
import type { UpdateMemberStatusDTO } from '@/dtos/UpdateMemberStatusDTO';
import { clampPercentage } from '@/utils/clampPercentage';
import { generateId } from '@/utils/generateId';
import { useMemberStatusStore } from '@/stores/memberstatusstore';

export class MemberStatusService {
  public static getMemberStatuses(): MemberStatusInterface[] {
    return useMemberStatusStore().memberStatuses;
  }

  public static getMemberStatusesByGroupId(groupId: number): MemberStatusInterface[] {
    return useMemberStatusStore().memberStatuses.filter(
      (status: MemberStatusInterface) => status.groupId === groupId,
    );
  }

  public static getMemberStatusById(id: number): Nullable<MemberStatusInterface> {
    return (
      useMemberStatusStore().memberStatuses.find(
        (status: MemberStatusInterface) => status.id === id,
      ) ?? null
    );
  }

  public static createMemberStatus(dto: CreateMemberStatusDTO): MemberStatusInterface {
    const store = useMemberStatusStore();
    const status: MemberStatusInterface = {
      id: generateId(store.memberStatuses),
      name: dto.name.trim(),
      groupId: dto.groupId,
      target: clampPercentage(dto.target),
    };
    store.addMemberStatus(status);
    return status;
  }

  public static updateMemberStatus(id: number, dto: UpdateMemberStatusDTO): MemberStatusInterface {
    const current = MemberStatusService.getMemberStatusById(id);
    if (current === null) {
      throw new Error('MEMBER_STATUS_NOT_FOUND');
    }

    const updated: MemberStatusInterface = {
      ...current,
      ...dto,
      name: (dto.name ?? current.name).trim(),
      target: clampPercentage(dto.target ?? current.target),
    };
    useMemberStatusStore().updateMemberStatus(updated);
    return updated;
  }

  public static deleteMemberStatus(id: number): void {
    useMemberStatusStore().removeMemberStatus(id);
  }

  public static deleteMemberStatusesByGroupId(groupId: number): void {
    MemberStatusService.getMemberStatusesByGroupId(groupId).forEach(
      (status: MemberStatusInterface) => {
        MemberStatusService.deleteMemberStatus(status.id);
      },
    );
  }
}

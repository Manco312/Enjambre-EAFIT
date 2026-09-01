import type { CreatePermanenceTargetDTO } from '@/dtos/CreatePermanenceTargetDTO';
import type { Nullable } from '@/types/Nullable';
import type { PermanenceTargetInterface } from '@/interfaces/PermanenceTargetInterface';
import type { UpdatePermanenceTargetDTO } from '@/dtos/UpdatePermanenceTargetDTO';
import { clampPercentage } from '@/utils/clampPercentage';
import { generateId } from '@/utils/generateId';
import { usePermanenceTargetStore } from '@/stores/permanencetargetstore';

export class PermanenceTargetService {
  public static getTargetsByGroupId(groupId: number): PermanenceTargetInterface[] {
    return usePermanenceTargetStore().targets.filter(
      (target: PermanenceTargetInterface) => target.groupId === groupId,
    );
  }

  public static getTargetByMemberStatusId(
    memberStatusId: number,
  ): Nullable<PermanenceTargetInterface> {
    return (
      usePermanenceTargetStore().targets.find(
        (target: PermanenceTargetInterface) => target.memberStatusId === memberStatusId,
      ) ?? null
    );
  }

  public static createTarget(dto: CreatePermanenceTargetDTO): PermanenceTargetInterface {
    const store = usePermanenceTargetStore();
    const target: PermanenceTargetInterface = {
      id: generateId(store.targets),
      groupId: dto.groupId,
      memberStatusId: dto.memberStatusId,
      percentage: clampPercentage(dto.percentage),
    };
    store.addTarget(target);
    return target;
  }

  public static updateTarget(
    id: number,
    dto: UpdatePermanenceTargetDTO,
  ): PermanenceTargetInterface {
    const store = usePermanenceTargetStore();
    const current = store.targets.find((target: PermanenceTargetInterface) => target.id === id);
    if (current === undefined) {
      throw new Error('PERMANENCE_TARGET_NOT_FOUND');
    }

    const updated: PermanenceTargetInterface = {
      ...current,
      ...dto,
      percentage: clampPercentage(dto.percentage ?? current.percentage),
    };
    store.updateTarget(updated);
    return updated;
  }

  public static upsertForMemberStatus(
    groupId: number,
    memberStatusId: number,
    percentage: number,
  ): PermanenceTargetInterface {
    const existing = PermanenceTargetService.getTargetByMemberStatusId(memberStatusId);
    if (existing !== null) {
      return PermanenceTargetService.updateTarget(existing.id, { percentage });
    }
    return PermanenceTargetService.createTarget({ groupId, memberStatusId, percentage });
  }

  public static deleteTargetByMemberStatusId(memberStatusId: number): void {
    const existing = PermanenceTargetService.getTargetByMemberStatusId(memberStatusId);
    if (existing !== null) {
      usePermanenceTargetStore().removeTarget(existing.id);
    }
  }

  public static deleteTargetsByGroupId(groupId: number): void {
    const store = usePermanenceTargetStore();
    PermanenceTargetService.getTargetsByGroupId(groupId).forEach(
      (target: PermanenceTargetInterface) => {
        store.removeTarget(target.id);
      },
    );
  }
}

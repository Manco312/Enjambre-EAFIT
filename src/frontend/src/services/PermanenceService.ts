import type { PermanenceInterface } from '@/interfaces/PermanenceInterface';
import type { SetPermanenceDTO } from '@/dtos/SetPermanenceDTO';
import { generateId } from '@/utils/generateId';
import { usePermanenceStore } from '@/stores/permanencestore';

export class PermanenceService {
  public static getByActivityId(activityId: number): PermanenceInterface[] {
    return usePermanenceStore().permanences.filter(
      (permanence: PermanenceInterface) => permanence.activityId === activityId,
    );
  }

  public static getPercentage(activityId: number, memberId: number): number {
    return (
      usePermanenceStore().permanences.find(
        (permanence: PermanenceInterface) =>
          permanence.activityId === activityId && permanence.memberId === memberId,
      )?.percentage ?? 0
    );
  }

  public static setPercentage(dto: SetPermanenceDTO): PermanenceInterface {
    const store = usePermanenceStore();
    const percentage = Math.max(0, dto.percentage);
    const existing = store.permanences.find(
      (permanence: PermanenceInterface) =>
        permanence.activityId === dto.activityId && permanence.memberId === dto.memberId,
    );

    if (existing !== undefined) {
      const updated: PermanenceInterface = { ...existing, percentage };
      store.updatePermanence(updated);
      return updated;
    }

    const created: PermanenceInterface = {
      id: generateId(store.permanences),
      activityId: dto.activityId,
      memberId: dto.memberId,
      percentage,
    };
    store.addPermanence(created);
    return created;
  }

  public static deleteByActivityId(activityId: number): void {
    usePermanenceStore().removePermanences(
      (permanence: PermanenceInterface) => permanence.activityId === activityId,
    );
  }

  public static deleteByMemberId(memberId: number): void {
    usePermanenceStore().removePermanences(
      (permanence: PermanenceInterface) => permanence.memberId === memberId,
    );
  }
}

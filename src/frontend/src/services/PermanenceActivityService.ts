import type { CreatePermanenceActivityDTO } from '@/dtos/CreatePermanenceActivityDTO';
import type { Nullable } from '@/types/Nullable';
import type { PermanenceActivityInterface } from '@/interfaces/PermanenceActivityInterface';
import type { UpdatePermanenceActivityDTO } from '@/dtos/UpdatePermanenceActivityDTO';
import { PERMANENCE_ACTIVITY_SCOPES } from '@/constants/permanenceActivityScopes';
import { PermanenceRecordService } from '@/services/PermanenceRecordService';
import { clampPercentage } from '@/utils/clampPercentage';
import { generateId } from '@/utils/generateId';
import { usePermanenceActivityStore } from '@/stores/permanenceactivitystore';

export class PermanenceActivityService {
  public static getActivitiesByGroupId(groupId: number): PermanenceActivityInterface[] {
    return usePermanenceActivityStore().activities.filter(
      (activity: PermanenceActivityInterface) => activity.groupId === groupId,
    );
  }

  public static getGeneralActivities(groupId: number): PermanenceActivityInterface[] {
    return PermanenceActivityService.getActivitiesByGroupId(groupId).filter(
      (activity: PermanenceActivityInterface) =>
        activity.scope === PERMANENCE_ACTIVITY_SCOPES.GENERAL,
    );
  }

  public static getCommitteeActivities(committeeId: number): PermanenceActivityInterface[] {
    return usePermanenceActivityStore().activities.filter(
      (activity: PermanenceActivityInterface) => activity.committeeId === committeeId,
    );
  }

  public static getActivityById(id: number): Nullable<PermanenceActivityInterface> {
    return (
      usePermanenceActivityStore().activities.find(
        (activity: PermanenceActivityInterface) => activity.id === id,
      ) ?? null
    );
  }

  public static createActivity(dto: CreatePermanenceActivityDTO): PermanenceActivityInterface {
    const store = usePermanenceActivityStore();
    const activity: PermanenceActivityInterface = {
      id: generateId(store.activities),
      groupId: dto.groupId,
      scope: dto.scope,
      committeeId: dto.scope === PERMANENCE_ACTIVITY_SCOPES.COMMITTEE ? dto.committeeId : null,
      name: dto.name.trim(),
      description: dto.description.trim(),
      weight: clampPercentage(dto.weight),
      period: dto.period.trim(),
    };
    store.addActivity(activity);
    return activity;
  }

  public static updateActivity(
    id: number,
    dto: UpdatePermanenceActivityDTO,
  ): PermanenceActivityInterface {
    const store = usePermanenceActivityStore();
    const current = store.activities.find(
      (activity: PermanenceActivityInterface) => activity.id === id,
    );
    if (current === undefined) {
      throw new Error('PERMANENCE_ACTIVITY_NOT_FOUND');
    }

    const updated: PermanenceActivityInterface = {
      ...current,
      name: (dto.name ?? current.name).trim(),
      description: (dto.description ?? current.description).trim(),
      weight: clampPercentage(dto.weight ?? current.weight),
      period: (dto.period ?? current.period).trim(),
    };
    store.updateActivity(updated);
    return updated;
  }

  public static deleteActivity(id: number): void {
    PermanenceRecordService.deleteRecordsByActivityId(id);
    usePermanenceActivityStore().removeActivity(id);
  }

  public static deleteActivitiesByGroupId(groupId: number): void {
    PermanenceActivityService.getActivitiesByGroupId(groupId).forEach(
      (activity: PermanenceActivityInterface) => {
        PermanenceActivityService.deleteActivity(activity.id);
      },
    );
  }

  public static deleteActivitiesByCommitteeId(committeeId: number): void {
    PermanenceActivityService.getCommitteeActivities(committeeId).forEach(
      (activity: PermanenceActivityInterface) => {
        PermanenceActivityService.deleteActivity(activity.id);
      },
    );
  }
}

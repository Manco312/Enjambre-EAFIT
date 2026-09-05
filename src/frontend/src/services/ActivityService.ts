import type { ActivityInterface } from '@/interfaces/ActivityInterface';
import type { CreateActivityDTO } from '@/dtos/CreateActivityDTO';
import type { Nullable } from '@/types/Nullable';
import type { UpdateActivityDTO } from '@/dtos/UpdateActivityDTO';
import { PermanenceService } from '@/services/PermanenceService';
import { clampPercentage } from '@/utils/clampPercentage';
import { generateId } from '@/utils/generateId';
import { useActivityStore } from '@/stores/activitystore';

export class ActivityService {
  public static getActivitiesByGroupId(groupId: number): ActivityInterface[] {
    return useActivityStore().activities.filter(
      (activity: ActivityInterface) => activity.groupId === groupId,
    );
  }

  public static getGeneralActivities(groupId: number): ActivityInterface[] {
    return ActivityService.getActivitiesByGroupId(groupId).filter(
      (activity: ActivityInterface) => activity.committeeId === null,
    );
  }

  public static getCommitteeActivities(committeeId: number): ActivityInterface[] {
    return useActivityStore().activities.filter(
      (activity: ActivityInterface) => activity.committeeId === committeeId,
    );
  }

  public static getActivityById(id: number): Nullable<ActivityInterface> {
    return (
      useActivityStore().activities.find((activity: ActivityInterface) => activity.id === id) ??
      null
    );
  }

  public static createActivity(dto: CreateActivityDTO): ActivityInterface {
    const store = useActivityStore();
    const activity: ActivityInterface = {
      id: generateId(store.activities),
      groupId: dto.groupId,
      committeeId: dto.committeeId,
      name: dto.name.trim(),
      description: dto.description.trim(),
      weight: clampPercentage(dto.weight),
      period: dto.period.trim(),
    };
    store.addActivity(activity);
    return activity;
  }

  public static updateActivity(id: number, dto: UpdateActivityDTO): ActivityInterface {
    const store = useActivityStore();
    const current = store.activities.find((activity: ActivityInterface) => activity.id === id);
    if (current === undefined) {
      throw new Error('ACTIVITY_NOT_FOUND');
    }

    const updated: ActivityInterface = {
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
    PermanenceService.deleteByActivityId(id);
    useActivityStore().removeActivity(id);
  }

  public static deleteActivitiesByGroupId(groupId: number): void {
    ActivityService.getActivitiesByGroupId(groupId).forEach((activity: ActivityInterface) => {
      ActivityService.deleteActivity(activity.id);
    });
  }

  public static deleteActivitiesByCommitteeId(committeeId: number): void {
    ActivityService.getCommitteeActivities(committeeId).forEach((activity: ActivityInterface) => {
      ActivityService.deleteActivity(activity.id);
    });
  }
}

import axios from 'axios';

import type { ActivityInterface } from '@/interfaces/ActivityInterface';
import type { CreateActivityDTO } from '@/dtos/CreateActivityDTO';
import type { Nullable } from '@/types/Nullable';
import type { UpdateActivityDTO } from '@/dtos/UpdateActivityDTO';
import { ENVIRONMENT } from '@/constants/environment';
import { clampPercentage } from '@/utils/clampPercentage';

const ACTIVITIES_URL = `${ENVIRONMENT.API_URL}/activities`;

export class ActivityService {
  public static async getActivitiesByGroupId(groupId: number): Promise<ActivityInterface[]> {
    const { data } = await axios.get<ActivityInterface[]>(ACTIVITIES_URL, {
      params: { groupId },
    });
    return data;
  }

  public static async getGeneralActivities(groupId: number): Promise<ActivityInterface[]> {
    const activities = await ActivityService.getActivitiesByGroupId(groupId);
    return activities.filter((activity: ActivityInterface) => activity.committeeId === null);
  }

  public static async getCommitteeActivities(committeeId: number): Promise<ActivityInterface[]> {
    const { data } = await axios.get<ActivityInterface[]>(ACTIVITIES_URL, {
      params: { committeeId },
    });
    return data;
  }

  public static async getActivityById(id: number): Promise<Nullable<ActivityInterface>> {
    try {
      const { data } = await axios.get<ActivityInterface>(`${ACTIVITIES_URL}/${id}`);
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  public static async createActivity(dto: CreateActivityDTO): Promise<ActivityInterface> {
    const { data } = await axios.post<ActivityInterface>(ACTIVITIES_URL, {
      groupId: dto.groupId,
      committeeId: dto.committeeId,
      name: dto.name.trim(),
      description: dto.description.trim(),
      weight: clampPercentage(dto.weight),
    });
    return data;
  }

  public static async updateActivity(
    id: number,
    dto: UpdateActivityDTO,
  ): Promise<ActivityInterface> {
    const payload: UpdateActivityDTO = {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
      ...(dto.weight !== undefined ? { weight: clampPercentage(dto.weight) } : {}),
    };
    const { data } = await axios.patch<ActivityInterface>(`${ACTIVITIES_URL}/${id}`, payload);
    return data;
  }

  // El backend borra en cascada las permanencias de la actividad.
  public static async deleteActivity(id: number): Promise<void> {
    await axios.delete(`${ACTIVITIES_URL}/${id}`);
  }
}

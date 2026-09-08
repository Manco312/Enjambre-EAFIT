import axios from 'axios';

import type { PermanenceInterface } from '@/interfaces/PermanenceInterface';
import type { SetPermanenceDTO } from '@/dtos/SetPermanenceDTO';
import { ENVIRONMENT } from '@/constants/environment';

const PERMANENCES_URL = `${ENVIRONMENT.API_URL}/permanences`;

export class PermanenceService {
  public static async getByActivityId(activityId: number): Promise<PermanenceInterface[]> {
    const { data } = await axios.get<PermanenceInterface[]>(PERMANENCES_URL, {
      params: { activityId },
    });
    return data;
  }

  public static async getByGroupId(groupId: number): Promise<PermanenceInterface[]> {
    const { data } = await axios.get<PermanenceInterface[]>(PERMANENCES_URL, {
      params: { groupId },
    });
    return data;
  }

  // Upsert: si ya existe una permanencia para (actividad, miembro) la actualiza;
  // si no, la crea.
  public static async setPercentage(dto: SetPermanenceDTO): Promise<PermanenceInterface> {
    const percentage = Math.max(0, Math.round(dto.percentage));
    const existing = (await PermanenceService.getByActivityId(dto.activityId)).find(
      (permanence: PermanenceInterface) => permanence.memberId === dto.memberId,
    );

    if (existing !== undefined) {
      const { data } = await axios.patch<PermanenceInterface>(`${PERMANENCES_URL}/${existing.id}`, {
        percentage,
      });
      return data;
    }

    const { data } = await axios.post<PermanenceInterface>(PERMANENCES_URL, {
      activityId: dto.activityId,
      memberId: dto.memberId,
      percentage,
    });
    return data;
  }
}

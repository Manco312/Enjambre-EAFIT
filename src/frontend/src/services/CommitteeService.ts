import axios from 'axios';

import type { CommitteeInterface } from '@/interfaces/CommitteeInterface';
import type { CreateCommitteeDTO } from '@/dtos/CreateCommitteeDTO';
import type { Nullable } from '@/types/Nullable';
import type { UpdateCommitteeDTO } from '@/dtos/UpdateCommitteeDTO';
import { ENVIRONMENT } from '@/constants/environment';

const COMMITTEES_URL = `${ENVIRONMENT.API_URL}/committees`;

export class CommitteeService {
  public static async getCommittees(): Promise<CommitteeInterface[]> {
    const { data } = await axios.get<CommitteeInterface[]>(COMMITTEES_URL);
    return data;
  }

  public static async getCommitteeById(id: number): Promise<Nullable<CommitteeInterface>> {
    try {
      const { data } = await axios.get<CommitteeInterface>(`${COMMITTEES_URL}/${id}`);
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  public static async getCommitteesByGroupId(groupId: number): Promise<CommitteeInterface[]> {
    const { data } = await axios.get<CommitteeInterface[]>(COMMITTEES_URL, {
      params: { groupId },
    });
    return data;
  }

  public static async createCommittee(dto: CreateCommitteeDTO): Promise<CommitteeInterface> {
    const { data } = await axios.post<CommitteeInterface>(COMMITTEES_URL, {
      name: dto.name.trim(),
      groupId: dto.groupId,
    });
    return data;
  }

  public static async updateCommittee(
    id: number,
    dto: UpdateCommitteeDTO,
  ): Promise<CommitteeInterface> {
    const payload: UpdateCommitteeDTO = {
      ...dto,
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
    };
    const { data } = await axios.patch<CommitteeInterface>(`${COMMITTEES_URL}/${id}`, payload);
    return data;
  }

  public static async deleteCommittee(id: number): Promise<void> {
    await axios.delete(`${COMMITTEES_URL}/${id}`);
  }
}

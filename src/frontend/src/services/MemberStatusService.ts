import axios from 'axios';

import type { CreateMemberStatusDTO } from '@/dtos/CreateMemberStatusDTO';
import type { MemberStatusInterface } from '@/interfaces/MemberStatusInterface';
import type { Nullable } from '@/types/Nullable';
import type { UpdateMemberStatusDTO } from '@/dtos/UpdateMemberStatusDTO';
import { ENVIRONMENT } from '@/constants/environment';
import { clampPercentage } from '@/utils/clampPercentage';

const MEMBER_STATUSES_URL = `${ENVIRONMENT.API_URL}/member-statuses`;

export class MemberStatusService {
  public static async getMemberStatuses(): Promise<MemberStatusInterface[]> {
    const { data } = await axios.get<MemberStatusInterface[]>(MEMBER_STATUSES_URL);
    return data;
  }

  public static async getMemberStatusesByGroupId(
    groupId: number,
  ): Promise<MemberStatusInterface[]> {
    const { data } = await axios.get<MemberStatusInterface[]>(MEMBER_STATUSES_URL, {
      params: { groupId },
    });
    return data;
  }

  public static async getMemberStatusById(id: number): Promise<Nullable<MemberStatusInterface>> {
    try {
      const { data } = await axios.get<MemberStatusInterface>(`${MEMBER_STATUSES_URL}/${id}`);
      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  public static async createMemberStatus(
    dto: CreateMemberStatusDTO,
  ): Promise<MemberStatusInterface> {
    const { data } = await axios.post<MemberStatusInterface>(MEMBER_STATUSES_URL, {
      name: dto.name.trim(),
      groupId: dto.groupId,
      target: clampPercentage(dto.target),
    });
    return data;
  }

  public static async updateMemberStatus(
    id: number,
    dto: UpdateMemberStatusDTO,
  ): Promise<MemberStatusInterface> {
    const payload: UpdateMemberStatusDTO = {
      ...dto,
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.target !== undefined ? { target: clampPercentage(dto.target) } : {}),
    };
    const { data } = await axios.patch<MemberStatusInterface>(
      `${MEMBER_STATUSES_URL}/${id}`,
      payload,
    );
    return data;
  }

  public static async deleteMemberStatus(id: number): Promise<void> {
    await axios.delete(`${MEMBER_STATUSES_URL}/${id}`);
  }
}

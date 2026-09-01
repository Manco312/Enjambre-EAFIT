import type { CommitteeInterface } from '@/interfaces/CommitteeInterface';
import type { CreateCommitteeDTO } from '@/dtos/CreateCommitteeDTO';
import type { Nullable } from '@/types/Nullable';
import type { UpdateCommitteeDTO } from '@/dtos/UpdateCommitteeDTO';
import { DomainError } from '@/utils/DomainError';
import { generateId } from '@/utils/generateId';
import { useCommitteeStore } from '@/stores/committeestore';

export class CommitteeService {
  public static getCommittees(): CommitteeInterface[] {
    return useCommitteeStore().committees;
  }

  public static getCommitteeById(id: number): Nullable<CommitteeInterface> {
    return (
      useCommitteeStore().committees.find((committee: CommitteeInterface) => committee.id === id) ??
      null
    );
  }

  public static getCommitteesByGroupId(groupId: number): CommitteeInterface[] {
    return useCommitteeStore().committees.filter(
      (committee: CommitteeInterface) => committee.groupId === groupId,
    );
  }

  public static createCommittee(dto: CreateCommitteeDTO): CommitteeInterface {
    const store = useCommitteeStore();
    const committee: CommitteeInterface = {
      id: generateId(store.committees),
      name: dto.name.trim(),
      groupId: dto.groupId,
    };
    store.addCommittee(committee);
    return committee;
  }

  public static updateCommittee(id: number, dto: UpdateCommitteeDTO): CommitteeInterface {
    const current = CommitteeService.getCommitteeById(id);
    if (current === null) {
      throw new DomainError('COMMITTEE_NOT_FOUND');
    }

    const updated: CommitteeInterface = {
      ...current,
      ...dto,
      name: (dto.name ?? current.name).trim(),
    };
    useCommitteeStore().updateCommittee(updated);
    return updated;
  }

  public static deleteCommittee(id: number): void {
    useCommitteeStore().removeCommittee(id);
  }

  public static deleteCommitteesByGroupId(groupId: number): void {
    CommitteeService.getCommitteesByGroupId(groupId).forEach((committee: CommitteeInterface) => {
      CommitteeService.deleteCommittee(committee.id);
    });
  }
}

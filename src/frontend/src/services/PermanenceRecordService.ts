import type { PermanenceRecordInterface } from '@/interfaces/PermanenceRecordInterface';
import type { SetPermanenceRecordDTO } from '@/dtos/SetPermanenceRecordDTO';
import { generateId } from '@/utils/generateId';
import { usePermanenceRecordStore } from '@/stores/permanencerecordstore';

export class PermanenceRecordService {
  public static getRecordsByActivityId(activityId: number): PermanenceRecordInterface[] {
    return usePermanenceRecordStore().records.filter(
      (record: PermanenceRecordInterface) => record.activityId === activityId,
    );
  }

  public static getValue(activityId: number, memberId: number): number {
    return (
      usePermanenceRecordStore().records.find(
        (record: PermanenceRecordInterface) =>
          record.activityId === activityId && record.memberId === memberId,
      )?.value ?? 0
    );
  }

  public static setValue(dto: SetPermanenceRecordDTO): PermanenceRecordInterface {
    const store = usePermanenceRecordStore();
    const value = Math.max(0, dto.value);
    const existing = store.records.find(
      (record: PermanenceRecordInterface) =>
        record.activityId === dto.activityId && record.memberId === dto.memberId,
    );

    if (existing !== undefined) {
      const updated: PermanenceRecordInterface = { ...existing, value };
      store.updateRecord(updated);
      return updated;
    }

    const created: PermanenceRecordInterface = {
      id: generateId(store.records),
      activityId: dto.activityId,
      memberId: dto.memberId,
      value,
    };
    store.addRecord(created);
    return created;
  }

  public static deleteRecordsByActivityId(activityId: number): void {
    usePermanenceRecordStore().removeRecords(
      (record: PermanenceRecordInterface) => record.activityId === activityId,
    );
  }

  public static deleteRecordsByMemberId(memberId: number): void {
    usePermanenceRecordStore().removeRecords(
      (record: PermanenceRecordInterface) => record.memberId === memberId,
    );
  }
}

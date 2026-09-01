import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { PermanenceRecordInterface } from '@/interfaces/PermanenceRecordInterface';

export const usePermanenceRecordStore = defineStore('permanenceRecord', () => {
  const records = ref<PermanenceRecordInterface[]>([]);

  function addRecord(record: PermanenceRecordInterface): void {
    records.value.push(record);
  }

  function updateRecord(record: PermanenceRecordInterface): void {
    const index = records.value.findIndex(
      (item: PermanenceRecordInterface) => item.id === record.id,
    );
    if (index !== -1) {
      records.value.splice(index, 1, record);
    }
  }

  function removeRecords(predicate: (record: PermanenceRecordInterface) => boolean): void {
    records.value = records.value.filter((item: PermanenceRecordInterface) => !predicate(item));
  }

  return { records, addRecord, updateRecord, removeRecords };
});

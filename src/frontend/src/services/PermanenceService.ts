import type { CommitteeInterface } from '@/interfaces/CommitteeInterface';
import type { MemberInterface } from '@/interfaces/MemberInterface';
import type { PermanenceActivityInterface } from '@/interfaces/PermanenceActivityInterface';
import { CommitteeService } from '@/services/CommitteeService';
import { MemberService } from '@/services/MemberService';
import { MemberStatusService } from '@/services/MemberStatusService';
import { PermanenceActivityService } from '@/services/PermanenceActivityService';
import { PermanenceRecordService } from '@/services/PermanenceRecordService';
import { PermanenceTargetService } from '@/services/PermanenceTargetService';

export type PermanenceSheetKey = 'general' | number;

export interface PermanenceSheetOption {
  key: PermanenceSheetKey;
  label: string;
}

export interface PermanenceSubtotalColumn {
  committeeId: number;
  committeeName: string;
}

export interface PermanenceRow {
  member: MemberInterface;
  statusLabel: string;
  values: Record<number, number>;
  subtotals: Record<number, number>;
  total: number;
  maxTotal: number;
  score: number;
  target: number;
  meets: boolean;
}

export interface PermanenceSheetView {
  isGeneral: boolean;
  activityColumns: PermanenceActivityInterface[];
  subtotalColumns: PermanenceSubtotalColumn[];
  rows: PermanenceRow[];
}

const GENERAL_KEY = 'general' as const;

export class PermanenceService {
  public static getSheetOptions(groupId: number): PermanenceSheetOption[] {
    const committeeOptions = CommitteeService.getCommitteesByGroupId(groupId).map(
      (committee: CommitteeInterface) => ({ key: committee.id, label: committee.name }),
    );
    return [{ key: GENERAL_KEY, label: 'General' }, ...committeeOptions];
  }

  public static setValue(activityId: number, memberId: number, value: number): void {
    const safeValue = Number.isNaN(value) ? 0 : value;
    const maxValue = PermanenceActivityService.getActivityById(activityId)?.weight ?? 100;
    const bounded = Math.min(maxValue, Math.max(0, Math.round(safeValue * 10) / 10));
    PermanenceRecordService.setValue({ activityId, memberId, value: bounded });
  }

  public static getTargetForMember(groupId: number, member: MemberInterface): number {
    const percentages = MemberStatusService.getMemberStatusesByGroupId(groupId)
      .filter((status) => member.membershipStatus.includes(status.name))
      .map((status) => PermanenceTargetService.getTargetByMemberStatusId(status.id))
      .filter((target): target is NonNullable<typeof target> => target !== null)
      .map((target) => target.percentage);

    return percentages.length > 0 ? Math.max(...percentages) : 0;
  }

  public static buildSheet(groupId: number, sheetKey: PermanenceSheetKey): PermanenceSheetView {
    if (sheetKey === GENERAL_KEY) {
      return PermanenceService.buildGeneralSheet(groupId);
    }
    return PermanenceService.buildCommitteeSheet(groupId, sheetKey);
  }

  private static buildGeneralSheet(groupId: number): PermanenceSheetView {
    const activityColumns = PermanenceActivityService.getGeneralActivities(groupId);
    const committees = CommitteeService.getCommitteesByGroupId(groupId);
    const members = MemberService.getMembersByGroupId(groupId);
    const generalMax = PermanenceService.sumWeights(activityColumns);

    const rows: PermanenceRow[] = members.map((member: MemberInterface) => {
      const values = PermanenceService.readValues(activityColumns, member.id);
      const generalPoints = PermanenceService.sumValues(activityColumns, values);

      const subtotals: Record<number, number> = {};
      let committeePoints = 0;
      let committeeMax = 0;

      committees
        .filter((committee: CommitteeInterface) => member.areas.includes(committee.name))
        .forEach((committee: CommitteeInterface) => {
          const committeeActivities = PermanenceActivityService.getCommitteeActivities(
            committee.id,
          );
          const committeeValues = PermanenceService.readValues(committeeActivities, member.id);
          const subtotal = PermanenceService.sumValues(committeeActivities, committeeValues);
          subtotals[committee.id] = subtotal;
          committeePoints += subtotal;
          committeeMax += PermanenceService.sumWeights(committeeActivities);
        });

      const total = generalPoints + committeePoints;
      const maxTotal = generalMax + committeeMax;
      const score = PermanenceService.toScore(total, maxTotal);
      const target = PermanenceService.getTargetForMember(groupId, member);

      return {
        member,
        statusLabel: PermanenceService.statusLabel(member),
        values,
        subtotals,
        total,
        maxTotal,
        score,
        target,
        meets: score >= target,
      };
    });

    return {
      isGeneral: true,
      activityColumns,
      subtotalColumns: committees.map((committee: CommitteeInterface) => ({
        committeeId: committee.id,
        committeeName: committee.name,
      })),
      rows,
    };
  }

  private static buildCommitteeSheet(groupId: number, committeeId: number): PermanenceSheetView {
    const committee = CommitteeService.getCommitteeById(committeeId);
    const activityColumns = PermanenceActivityService.getCommitteeActivities(committeeId);
    const maxTotal = PermanenceService.sumWeights(activityColumns);
    const members =
      committee === null
        ? []
        : MemberService.getMembersByGroupId(groupId).filter((member: MemberInterface) =>
            member.areas.includes(committee.name),
          );

    const rows: PermanenceRow[] = members.map((member: MemberInterface) => {
      const values = PermanenceService.readValues(activityColumns, member.id);
      const total = PermanenceService.sumValues(activityColumns, values);
      const score = PermanenceService.toScore(total, maxTotal);
      const target = PermanenceService.getTargetForMember(groupId, member);

      return {
        member,
        statusLabel: PermanenceService.statusLabel(member),
        values,
        subtotals: {},
        total,
        maxTotal,
        score,
        target,
        meets: score >= target,
      };
    });

    return { isGeneral: false, activityColumns, subtotalColumns: [], rows };
  }

  private static readValues(
    activities: PermanenceActivityInterface[],
    memberId: number,
  ): Record<number, number> {
    const values: Record<number, number> = {};
    activities.forEach((activity: PermanenceActivityInterface) => {
      values[activity.id] = PermanenceRecordService.getValue(activity.id, memberId);
    });
    return values;
  }

  // Cada valor ya está expresado en puntos de permanencia (0..peso de la actividad),
  // por lo que el total de una hoja es simplemente su suma.
  private static sumValues(
    activities: PermanenceActivityInterface[],
    values: Record<number, number>,
  ): number {
    return activities.reduce(
      (sum: number, activity: PermanenceActivityInterface) => sum + (values[activity.id] ?? 0),
      0,
    );
  }

  private static sumWeights(activities: PermanenceActivityInterface[]): number {
    return activities.reduce(
      (sum: number, activity: PermanenceActivityInterface) => sum + activity.weight,
      0,
    );
  }

  private static toScore(total: number, maxTotal: number): number {
    return maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  }

  private static statusLabel(member: MemberInterface): string {
    return member.membershipStatus.length > 0 ? member.membershipStatus.join(', ') : '—';
  }
}

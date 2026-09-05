import type { ActivityInterface } from '@/interfaces/ActivityInterface';
import type { CommitteeInterface } from '@/interfaces/CommitteeInterface';
import { ActivityService } from '@/services/ActivityService';
import { CommitteeService } from '@/services/CommitteeService';
import { MemberService, type MemberWithMembership } from '@/services/MemberService';
import { MemberStatusService } from '@/services/MemberStatusService';
import { PermanenceService } from '@/services/PermanenceService';

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
  member: MemberWithMembership;
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
  activityColumns: ActivityInterface[];
  subtotalColumns: PermanenceSubtotalColumn[];
  rows: PermanenceRow[];
}

const GENERAL_KEY = 'general' as const;

export class PermanenceSheetService {
  public static getSheetOptions(groupId: number): PermanenceSheetOption[] {
    const committeeOptions = CommitteeService.getCommitteesByGroupId(groupId).map(
      (committee: CommitteeInterface) => ({ key: committee.id, label: committee.name }),
    );
    return [{ key: GENERAL_KEY, label: 'General' }, ...committeeOptions];
  }

  public static setValue(activityId: number, memberId: number, value: number): void {
    const safeValue = Number.isNaN(value) ? 0 : value;
    const maxValue = ActivityService.getActivityById(activityId)?.weight ?? 100;
    const bounded = Math.min(maxValue, Math.max(0, Math.round(safeValue * 10) / 10));
    PermanenceService.setPercentage({ activityId, memberId, percentage: bounded });
  }

  public static getTargetForMember(memberStatusId: number): number {
    return MemberStatusService.getMemberStatusById(memberStatusId)?.target ?? 0;
  }

  public static buildSheet(groupId: number, sheetKey: PermanenceSheetKey): PermanenceSheetView {
    if (sheetKey === GENERAL_KEY) {
      return PermanenceSheetService.buildGeneralSheet(groupId);
    }
    return PermanenceSheetService.buildCommitteeSheet(groupId, sheetKey);
  }

  private static buildGeneralSheet(groupId: number): PermanenceSheetView {
    const activityColumns = ActivityService.getGeneralActivities(groupId);
    const committees = CommitteeService.getCommitteesByGroupId(groupId);
    const members = MemberService.getMembersByGroupId(groupId);
    const generalMax = PermanenceSheetService.sumWeights(activityColumns);

    const rows: PermanenceRow[] = members.map((member: MemberWithMembership) => {
      const values = PermanenceSheetService.readValues(activityColumns, member.id);
      const generalPoints = PermanenceSheetService.sumValues(activityColumns, values);

      const subtotals: Record<number, number> = {};
      let committeePoints = 0;
      let committeeMax = 0;

      committees
        .filter((committee: CommitteeInterface) => member.committeeIds.includes(committee.id))
        .forEach((committee: CommitteeInterface) => {
          const committeeActivities = ActivityService.getCommitteeActivities(committee.id);
          const committeeValues = PermanenceSheetService.readValues(committeeActivities, member.id);
          const subtotal = PermanenceSheetService.sumValues(committeeActivities, committeeValues);
          subtotals[committee.id] = subtotal;
          committeePoints += subtotal;
          committeeMax += PermanenceSheetService.sumWeights(committeeActivities);
        });

      const total = generalPoints + committeePoints;
      const maxTotal = generalMax + committeeMax;
      const score = PermanenceSheetService.toScore(total, maxTotal);
      const target = PermanenceSheetService.getTargetForMember(member.memberStatusId);

      return {
        member,
        statusLabel: PermanenceSheetService.statusLabel(member),
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
    const activityColumns = ActivityService.getCommitteeActivities(committeeId);
    const maxTotal = PermanenceSheetService.sumWeights(activityColumns);
    const members =
      committee === null
        ? []
        : MemberService.getMembersByGroupId(groupId).filter((member: MemberWithMembership) =>
            member.committeeIds.includes(committee.id),
          );

    const rows: PermanenceRow[] = members.map((member: MemberWithMembership) => {
      const values = PermanenceSheetService.readValues(activityColumns, member.id);
      const total = PermanenceSheetService.sumValues(activityColumns, values);
      const score = PermanenceSheetService.toScore(total, maxTotal);
      const target = PermanenceSheetService.getTargetForMember(member.memberStatusId);

      return {
        member,
        statusLabel: PermanenceSheetService.statusLabel(member),
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
    activities: ActivityInterface[],
    memberId: number,
  ): Record<number, number> {
    const values: Record<number, number> = {};
    activities.forEach((activity: ActivityInterface) => {
      values[activity.id] = PermanenceService.getPercentage(activity.id, memberId);
    });
    return values;
  }

  // Cada valor ya está expresado en puntos de permanencia (0..peso de la actividad),
  // por lo que el total de una hoja es simplemente su suma.
  private static sumValues(
    activities: ActivityInterface[],
    values: Record<number, number>,
  ): number {
    return activities.reduce(
      (sum: number, activity: ActivityInterface) => sum + (values[activity.id] ?? 0),
      0,
    );
  }

  private static sumWeights(activities: ActivityInterface[]): number {
    return activities.reduce(
      (sum: number, activity: ActivityInterface) => sum + activity.weight,
      0,
    );
  }

  private static toScore(total: number, maxTotal: number): number {
    return maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  }

  private static statusLabel(member: MemberWithMembership): string {
    return MemberService.getStatusName(member.memberStatusId);
  }
}

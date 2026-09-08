import type { ActivityInterface } from '@/interfaces/ActivityInterface';
import type { CommitteeInterface } from '@/interfaces/CommitteeInterface';
import type { MemberStatusInterface } from '@/interfaces/MemberStatusInterface';
import type { PermanenceInterface } from '@/interfaces/PermanenceInterface';
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

// Datos del grupo cargados una sola vez; las hojas se calculan en memoria.
interface SheetContext {
  activities: ActivityInterface[];
  committees: CommitteeInterface[];
  members: MemberWithMembership[];
  permanences: PermanenceInterface[];
  statuses: MemberStatusInterface[];
}

const GENERAL_KEY = 'general' as const;

export class PermanenceSheetService {
  public static async getSheetOptions(groupId: number): Promise<PermanenceSheetOption[]> {
    const committees = await CommitteeService.getCommitteesByGroupId(groupId);
    return [
      { key: GENERAL_KEY, label: 'General' },
      ...committees.map((committee: CommitteeInterface) => ({
        key: committee.id,
        label: committee.name,
      })),
    ];
  }

  public static async setValue(
    activityId: number,
    memberId: number,
    value: number,
    maxValue: number,
  ): Promise<void> {
    const safeValue = Number.isNaN(value) ? 0 : value;
    const bounded = Math.min(maxValue, Math.max(0, Math.round(safeValue)));
    await PermanenceService.setPercentage({ activityId, memberId, percentage: bounded });
  }

  public static async buildSheet(
    groupId: number,
    sheetKey: PermanenceSheetKey,
  ): Promise<PermanenceSheetView> {
    const [activities, committees, members, permanences, statuses] = await Promise.all([
      ActivityService.getActivitiesByGroupId(groupId),
      CommitteeService.getCommitteesByGroupId(groupId),
      MemberService.getMembersByGroupId(groupId),
      PermanenceService.getByGroupId(groupId),
      MemberStatusService.getMemberStatusesByGroupId(groupId),
    ]);

    const context: SheetContext = { activities, committees, members, permanences, statuses };

    return sheetKey === GENERAL_KEY
      ? PermanenceSheetService.buildGeneralSheet(context)
      : PermanenceSheetService.buildCommitteeSheet(context, sheetKey);
  }

  private static buildGeneralSheet(context: SheetContext): PermanenceSheetView {
    const activityColumns = context.activities.filter(
      (activity: ActivityInterface) => activity.committeeId === null,
    );
    const generalMax = PermanenceSheetService.sumWeights(activityColumns);

    const rows: PermanenceRow[] = context.members.map((member: MemberWithMembership) => {
      const values = PermanenceSheetService.readValues(
        activityColumns,
        member.id,
        context.permanences,
      );
      const generalPoints = PermanenceSheetService.sumValues(activityColumns, values);

      const subtotals: Record<number, number> = {};
      let committeePoints = 0;
      let committeeMax = 0;

      context.committees
        .filter((committee: CommitteeInterface) => member.committeeIds.includes(committee.id))
        .forEach((committee: CommitteeInterface) => {
          const committeeActivities = context.activities.filter(
            (activity: ActivityInterface) => activity.committeeId === committee.id,
          );
          const committeeValues = PermanenceSheetService.readValues(
            committeeActivities,
            member.id,
            context.permanences,
          );
          const subtotal = PermanenceSheetService.sumValues(committeeActivities, committeeValues);
          subtotals[committee.id] = subtotal;
          committeePoints += subtotal;
          committeeMax += PermanenceSheetService.sumWeights(committeeActivities);
        });

      const total = generalPoints + committeePoints;
      const maxTotal = generalMax + committeeMax;
      // El puntaje es la suma de los puntos de permanencia obtenidos (ya en %),
      // no una normalización sobre el total de pesos de la hoja.
      const score = total;
      const target = PermanenceSheetService.targetFor(member, context.statuses);

      return {
        member,
        statusLabel: PermanenceSheetService.statusLabel(member, context.statuses),
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
      subtotalColumns: context.committees.map((committee: CommitteeInterface) => ({
        committeeId: committee.id,
        committeeName: committee.name,
      })),
      rows,
    };
  }

  private static buildCommitteeSheet(
    context: SheetContext,
    committeeId: number,
  ): PermanenceSheetView {
    const activityColumns = context.activities.filter(
      (activity: ActivityInterface) => activity.committeeId === committeeId,
    );
    const maxTotal = PermanenceSheetService.sumWeights(activityColumns);
    const members = context.members.filter((member: MemberWithMembership) =>
      member.committeeIds.includes(committeeId),
    );

    const rows: PermanenceRow[] = members.map((member: MemberWithMembership) => {
      const values = PermanenceSheetService.readValues(
        activityColumns,
        member.id,
        context.permanences,
      );
      const total = PermanenceSheetService.sumValues(activityColumns, values);
      const score = total;
      const target = PermanenceSheetService.targetFor(member, context.statuses);

      return {
        member,
        statusLabel: PermanenceSheetService.statusLabel(member, context.statuses),
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
    permanences: PermanenceInterface[],
  ): Record<number, number> {
    const values: Record<number, number> = {};
    activities.forEach((activity: ActivityInterface) => {
      values[activity.id] =
        permanences.find(
          (permanence: PermanenceInterface) =>
            permanence.activityId === activity.id && permanence.memberId === memberId,
        )?.percentage ?? 0;
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

  private static targetFor(
    member: MemberWithMembership,
    statuses: MemberStatusInterface[],
  ): number {
    return statuses.find((status) => status.id === member.memberStatusId)?.target ?? 0;
  }

  private static statusLabel(
    member: MemberWithMembership,
    statuses: MemberStatusInterface[],
  ): string {
    return MemberService.getStatusName(member.memberStatusId, statuses);
  }
}

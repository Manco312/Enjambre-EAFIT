import type { PermanenceRow, PermanenceSheetOption } from '@/services/PermanenceSheetService';
import { MEMBER_COLUMNS } from '@/constants/memberColumns';
import { MemberService, type MemberWithMembership } from '@/services/MemberService';
import { PermanenceSheetService } from '@/services/PermanenceSheetService';

type CellValue = string | number;

export class ExcelExportService {
  public static async buildMembersBlob(
    members: MemberWithMembership[],
    sheetName: string,
  ): Promise<Blob> {
    const XLSX = await import('xlsx');

    const header = MEMBER_COLUMNS.map((column) => column.header);
    const body = members.map((member: MemberWithMembership) =>
      MEMBER_COLUMNS.map((column) => MemberService.fieldToText(member, column.key)),
    );

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
    worksheet['!cols'] = MEMBER_COLUMNS.map(() => ({ wch: 26 }));
    XLSX.utils.book_append_sheet(workbook, worksheet, ExcelExportService.safeSheetName(sheetName));

    return ExcelExportService.toBlob(XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }));
  }

  public static async buildPermanenceBlob(groupId: number): Promise<Blob> {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();

    PermanenceSheetService.getSheetOptions(groupId).forEach((option: PermanenceSheetOption) => {
      const sheet = PermanenceSheetService.buildSheet(groupId, option.key);

      const header: CellValue[] = ['Integrante', 'Estado'];
      sheet.activityColumns.forEach((activity) => {
        header.push(`${activity.name} (${activity.weight}%)`);
      });
      sheet.subtotalColumns.forEach((subtotal) => {
        header.push(`${subtotal.committeeName} (subtotal)`);
      });
      header.push('Puntaje %', 'Objetivo %', 'Cumple');

      const body: CellValue[][] = sheet.rows.map((row: PermanenceRow) => {
        const cells: CellValue[] = [MemberService.getDisplayName(row.member), row.statusLabel];
        sheet.activityColumns.forEach((activity) => {
          cells.push(row.values[activity.id] ?? 0);
        });
        sheet.subtotalColumns.forEach((subtotal) => {
          cells.push(Math.round(row.subtotals[subtotal.committeeId] ?? 0));
        });
        cells.push(Math.round(row.score), row.target, row.meets ? 'Sí' : 'No');
        return cells;
      });

      const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
      worksheet['!cols'] = header.map((_value, index) => ({ wch: index < 2 ? 28 : 16 }));
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        ExcelExportService.safeSheetName(option.label),
      );
    });

    return ExcelExportService.toBlob(XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }));
  }

  private static toBlob(output: unknown): Blob {
    return new Blob([output as ArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  private static safeSheetName(name: string): string {
    const sanitized = name.replace(/[\\/?*[\]:]/g, ' ').trim();
    return sanitized.length > 0 ? sanitized.slice(0, 31) : 'Hoja';
  }
}

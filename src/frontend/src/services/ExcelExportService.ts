import type { MemberInterface } from '@/interfaces/MemberInterface';
import { MEMBER_COLUMNS } from '@/constants/memberColumns';
import { MemberService } from '@/services/MemberService';

export class ExcelExportService {
  public static async buildMembersBlob(
    members: MemberInterface[],
    sheetName: string,
  ): Promise<Blob> {
    const XLSX = await import('xlsx');

    const header = MEMBER_COLUMNS.map((column) => column.header);
    const body = members.map((member: MemberInterface) =>
      MEMBER_COLUMNS.map((column) => MemberService.fieldToText(member, column.key)),
    );

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
    worksheet['!cols'] = MEMBER_COLUMNS.map(() => ({ wch: 26 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, ExcelExportService.safeSheetName(sheetName));

    const output = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
    return new Blob([output], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  private static safeSheetName(name: string): string {
    const sanitized = name.replace(/[\\/?*[\]:]/g, ' ').trim();
    return sanitized.length > 0 ? sanitized.slice(0, 31) : 'Miembros';
  }
}

import { IsInt, IsOptional } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateMemberDto } from './create-member.dto.js';

// Mismas reglas que el alta, todas opcionales. El estado en el grupo se cambia
// por `group-members`, no por aquí.
export class UpdateMemberDto extends PartialType(
  OmitType(CreateMemberDto, ['groupId', 'memberStatusId'] as const),
) {
  // Grupo al que se refieren los `committeeIds` enviados: solo se reemplazan
  // los comités de ese grupo y se conservan los de los demás grupos del miembro.
  @IsOptional()
  @IsInt()
  groupId?: number;
}

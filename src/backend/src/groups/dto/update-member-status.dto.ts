import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberStatusDto } from './create-member-status.dto.js';

export class UpdateMemberStatusDto extends PartialType(CreateMemberStatusDto) {}

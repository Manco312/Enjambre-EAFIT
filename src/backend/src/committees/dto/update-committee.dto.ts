import { PartialType } from '@nestjs/mapped-types';
import { CreateCommitteeDto } from './create-committee.dto.js';

export class UpdateCommitteeDto extends PartialType(CreateCommitteeDto) {}

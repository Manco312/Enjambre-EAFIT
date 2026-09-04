import { PartialType } from '@nestjs/mapped-types';
import { CreatePermanenceDto } from './create-permanence.dto.js';

export class UpdatePermanenceDto extends PartialType(CreatePermanenceDto) {}
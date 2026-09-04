import { IsInt } from 'class-validator';

export class CreatePermanenceDto {
  @IsInt()
  percentage: number;

  @IsInt()
  memberId: number;

  @IsInt()
  activityId: number;
}
import { IsInt, Max, Min } from 'class-validator';
import { MAX_PERCENTAGE } from '../../utils/validation.util.js';

export class CreatePermanenceDto {
  // Puntos obtenidos en la actividad: entero en [0, peso de la actividad]. El
  // tope contra el peso se valida en el servicio.
  @IsInt({ message: 'El puntaje debe ser un número entero.' })
  @Min(0, { message: 'El puntaje no puede ser negativo.' })
  @Max(MAX_PERCENTAGE, {
    message: `El puntaje no puede superar ${MAX_PERCENTAGE}.`,
  })
  percentage: number;

  @IsInt()
  memberId: number;

  @IsInt()
  activityId: number;
}

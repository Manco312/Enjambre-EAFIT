import { AppDataSource } from '../data-source.js';
import { Permanence } from '../../permanences/entities/permanence.entity.js';
import { Member } from '../../members/entities/member.entity.js';
import { Activity } from '../../activities/entities/activity.entity.js';

// Puntos obtenidos por actividad (nunca más que su peso). Juan suma 75 y
// cumple su objetivo de 70; María suma 45 y no llega al suyo de 80.
const PERMANENCES = [
  { idEpik: 1001, activityName: 'Asistencia a asambleas', percentage: 30 },
  { idEpik: 1001, activityName: 'Participación en eventos', percentage: 25 },
  { idEpik: 1001, activityName: 'Publicaciones en redes', percentage: 20 },
  { idEpik: 1002, activityName: 'Asistencia a asambleas', percentage: 20 },
  { idEpik: 1002, activityName: 'Participación en eventos', percentage: 10 },
  { idEpik: 1002, activityName: 'Informe de presupuesto', percentage: 15 },
];

export async function seedPermanences() {
  const repository = AppDataSource.getRepository(Permanence);
  const memberRepository = AppDataSource.getRepository(Member);
  const activityRepository = AppDataSource.getRepository(Activity);

  for (const data of PERMANENCES) {
    const member = await memberRepository.findOne({
      where: {
        idEpik: data.idEpik,
      },
    });

    const activity = await activityRepository.findOne({
      where: {
        name: data.activityName,
      },
    });

    if (!member || !activity) {
      throw new Error(
        'No se encontraron las entidades necesarias para Permanence.',
      );
    }

    if (data.percentage > activity.weight) {
      throw new Error(
        `El puntaje de "${data.activityName}" supera el peso de la actividad.`,
      );
    }

    const existing = await repository.findOne({
      where: {
        member: {
          id: member.id,
        },
        activity: {
          id: activity.id,
        },
      },
    });

    if (existing) {
      console.log(
        `La permanencia de "${member.fullName}" en "${data.activityName}" ya existe.`,
      );
      continue;
    }

    const permanence = repository.create({
      percentage: data.percentage,
      member,
      activity,
    });

    await repository.save(permanence);

    console.log(
      `Permanencia de "${member.fullName}" en "${data.activityName}" creada.`,
    );
  }
}

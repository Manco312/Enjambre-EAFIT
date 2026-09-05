import { AppDataSource } from '../data-source.js';
import { Permanence } from '../../permanences/entities/permanence.entity.js';
import { Member } from '../../members/entities/member.entity.js';
import { Activity } from '../../activities/entities/activity.entity.js';

export async function seedPermanences() {
  const repository = AppDataSource.getRepository(Permanence);

  const memberRepository = AppDataSource.getRepository(Member);
  const activityRepository = AppDataSource.getRepository(Activity);

  const member = await memberRepository.findOne({
    where: {
      idEpik: 1001,
    },
  });

  const activity = await activityRepository.findOne({
    where: {
      name: 'Actividad general',
    },
  });

  if (!member || !activity) {
    throw new Error(
      'No se encontraron las entidades necesarias para Permanence.',
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
    console.log('La permanencia ya existe.');
    return;
  }

  const permanence = repository.create({
    percentage: 100,
    member,
    activity,
  });

  await repository.save(permanence);

  console.log('Permanence creada.');
}

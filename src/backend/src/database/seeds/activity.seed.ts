import { AppDataSource } from '../data-source.js';
import { Activity } from '../../activities/entities/activity.entity.js';
import { Group } from '../../groups/entities/group.entity.js';
import { Committee } from '../../committees/entities/committee.entity.js';

export async function seedActivities() {
  const repository = AppDataSource.getRepository(Activity);

  const groupRepository = AppDataSource.getRepository(Group);
  const committeeRepository = AppDataSource.getRepository(Committee);

  const group = await groupRepository.findOne({
    where: {
      name: 'SPIE',
    },
  });

  if (!group) {
    throw new Error('No existe el grupo SPIE.');
  }

  const communicationsCommittee = await committeeRepository.findOne({
    where: {
      name: 'Comité de Comunicaciones',
      group: {
        id: group.id,
      },
    },
  });

  if (!communicationsCommittee) {
    throw new Error(
      'No existe el Comité de Comunicaciones.',
    );
  }

  const activitiesData = [
    {
      name: 'Actividad general',
      description: 'Actividad perteneciente al grupo general.',
      weight: 10,
      period: '2026',
      committee: null,
    },
    {
      name: 'Actividad de comunicaciones',
      description: 'Actividad del Comité de Comunicaciones.',
      weight: 20,
      period: '2026',
      committee: communicationsCommittee,
    },
  ];

  for (const data of activitiesData) {
    const existing = await repository.findOne({
      where: {
        name: data.name,
        group: {
          id: group.id,
        },
      },
    });

    if (existing) {
      console.log(`Actividad "${data.name}" ya existe.`);
      continue;
    }

    const activity = repository.create({
      ...data,
      group,
    });

    await repository.save(activity);

    console.log(`Actividad "${data.name}" creada.`);
  }
}

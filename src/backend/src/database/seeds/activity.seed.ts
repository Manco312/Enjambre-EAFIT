import { AppDataSource } from '../data-source.js';
import { Activity } from '../../activities/entities/activity.entity.js';
import { Group } from '../../groups/entities/group.entity.js';
import { Committee } from '../../committees/entities/committee.entity.js';
import { getCurrentPeriod } from '../../utils/period.util.js';

// Pesos en %. Las actividades generales suman 60 y las de cada comité 40, de
// modo que un integrante de un comité puede llegar a 100 puntos en total.
const ACTIVITIES = [
  {
    name: 'Asistencia a asambleas',
    description: 'Asistencia a las asambleas generales del grupo.',
    weight: 30,
    committeeName: null,
  },
  {
    name: 'Participación en eventos',
    description: 'Participación en los eventos organizados por el grupo.',
    weight: 30,
    committeeName: null,
  },
  {
    name: 'Publicaciones en redes',
    description: 'Publicaciones realizadas para las redes del grupo.',
    weight: 40,
    committeeName: 'Comité de Comunicaciones',
  },
  {
    name: 'Informe de presupuesto',
    description: 'Entrega del informe de presupuesto del semestre.',
    weight: 40,
    committeeName: 'Comité de Finanzas',
  },
];

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

  for (const data of ACTIVITIES) {
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

    let committee: Committee | null = null;

    if (data.committeeName !== null) {
      committee = await committeeRepository.findOne({
        where: {
          name: data.committeeName,
          group: {
            id: group.id,
          },
        },
      });

      if (!committee) {
        throw new Error(`No existe el ${data.committeeName}.`);
      }
    }

    const activity = repository.create({
      name: data.name,
      description: data.description,
      weight: data.weight,
      period: getCurrentPeriod(),
      group,
      committee,
    });

    await repository.save(activity);

    console.log(`Actividad "${data.name}" creada.`);
  }
}

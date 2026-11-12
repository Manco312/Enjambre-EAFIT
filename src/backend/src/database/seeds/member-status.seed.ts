import { AppDataSource } from '../data-source.js';
import { MemberStatus } from '../../groups/entities/member-status.entity.js';
import { Group } from '../../groups/entities/group.entity.js';

// Todo grupo necesita al menos un estado: sin estados no se le pueden agregar
// integrantes. El `target` es el puntaje de permanencia exigido (0-100).
const STATUSES = [
  { name: 'Activo', target: 70 },
  { name: 'Período de prueba', target: 80 },
  { name: 'Inactivo', target: 0 },
];

export async function seedMemberStatuses() {
  const statusRepository = AppDataSource.getRepository(MemberStatus);
  const groupRepository = AppDataSource.getRepository(Group);

  const groups = await groupRepository.find();

  if (groups.length === 0) {
    throw new Error('No hay grupos para crear estados de miembro.');
  }

  for (const group of groups) {
    for (const data of STATUSES) {
      const existing = await statusRepository.findOne({
        where: {
          name: data.name,
          group: {
            id: group.id,
          },
        },
      });

      if (existing) {
        console.log(`Estado "${data.name}" de "${group.name}" ya existe.`);
        continue;
      }

      const status = statusRepository.create({
        name: data.name,
        target: data.target,
        group,
      });

      await statusRepository.save(status);

      console.log(`Estado "${data.name}" de "${group.name}" creado.`);
    }
  }
}

import { AppDataSource } from '../data-source.js';
import { MemberStatus } from '../../groups/entities/member-status.entity.js';
import { Group } from '../../groups/entities/group.entity.js';

export async function seedMemberStatuses() {
  const statusRepository = AppDataSource.getRepository(MemberStatus);
  const groupRepository = AppDataSource.getRepository(Group);

  const group = await groupRepository.findOne({
    where: {
      name: 'SPIE',
    },
  });

  if (!group) {
    throw new Error('No existe el grupo SPIE.');
  }

  const statuses = [
    {
      name: 'Activo',
      target: 100,
    },
    {
      name: 'Inactivo',
      target: 0,
    },
  ];

  for (const data of statuses) {
    const existing = await statusRepository.findOne({
      where: {
        name: data.name,
        group: {
          id: group.id,
        },
      },
    });

    if (existing) {
      console.log(`Estado "${data.name}" ya existe.`);
      continue;
    }

    const status = statusRepository.create({
      name: data.name,
      target: data.target,
      group,
    });

    await statusRepository.save(status);

    console.log(`Estado "${data.name}" creado.`);
  }
}

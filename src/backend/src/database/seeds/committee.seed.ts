import { AppDataSource } from '../data-source.js';
import { Committee } from '../../committees/entities/committee.entity.js';
import { Group } from '../../groups/entities/group.entity.js';

export async function seedCommittees() {
  const repository = AppDataSource.getRepository(Committee);
  const groupRepository = AppDataSource.getRepository(Group);

  const group = await groupRepository.findOne({
    where: {
      name: 'SPIE',
    },
  });

  if (!group) {
    throw new Error('No existe el grupo SPIE.');
  }

  const committeesData = [
    {
      name: 'Comité de Comunicaciones',
    },
    {
      name: 'Comité de Finanzas',
    },
  ];

  for (const data of committeesData) {
    const existing = await repository.findOne({
      where: {
        name: data.name,
        group: {
          id: group.id,
        },
      },
    });

    if (existing) {
      console.log(`Comité "${data.name}" ya existe.`);
      continue;
    }

    const committee = repository.create({
      name: data.name,
      group,
    });

    await repository.save(committee);

    console.log(`Comité "${data.name}" creado.`);
  }
}

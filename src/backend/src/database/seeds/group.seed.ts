import { AppDataSource } from '../data-source.js';
import { Group } from '../../groups/entities/group.entity.js';

export async function seedGroups() {
  const repository = AppDataSource.getRepository(Group);

  const groupsData = [
    {
      name: 'SPIE',
    },
    {
      name: 'Organización Estudiantil (OE)',
    },
  ];

  const groups: Group[] = [];

  for (const data of groupsData) {
    let group = await repository.findOne({
      where: {
        name: data.name,
      },
    });

    if (!group) {
      group = repository.create(data);
      group = await repository.save(group);

      console.log(`Grupo "${group.name}" creado.`);
    } else {
      console.log(`Grupo "${group.name}" ya existe.`);
    }

    groups.push(group);
  }

  return groups;
}

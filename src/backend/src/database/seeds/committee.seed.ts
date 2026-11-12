import { AppDataSource } from '../data-source.js';
import { Committee } from '../../committees/entities/committee.entity.js';
import { Group } from '../../groups/entities/group.entity.js';
import { Member } from '../../members/entities/member.entity.js';

// Todo grupo necesita al menos un comité (así lo exige el formulario de grupos).
const COMMITTEES = [
  {
    groupName: 'SPIE',
    name: 'Comité de Comunicaciones',
    memberIdEpiks: [1001],
  },
  { groupName: 'SPIE', name: 'Comité de Finanzas', memberIdEpiks: [1002] },
  {
    groupName: 'Organización Estudiantil (OE)',
    name: 'Comité de Logística',
    memberIdEpiks: [],
  },
];

export async function seedCommittees() {
  const repository = AppDataSource.getRepository(Committee);
  const groupRepository = AppDataSource.getRepository(Group);
  const memberRepository = AppDataSource.getRepository(Member);

  for (const data of COMMITTEES) {
    const group = await groupRepository.findOne({
      where: {
        name: data.groupName,
      },
    });

    if (!group) {
      throw new Error(`No existe el grupo ${data.groupName}.`);
    }

    let committee = await repository.findOne({
      where: {
        name: data.name,
        group: {
          id: group.id,
        },
      },
    });

    if (committee) {
      console.log(`Comité "${data.name}" ya existe.`);
    } else {
      committee = await repository.save(
        repository.create({
          name: data.name,
          group,
        }),
      );

      console.log(`Comité "${data.name}" creado.`);
    }

    for (const idEpik of data.memberIdEpiks) {
      const member = await memberRepository.findOne({
        where: {
          idEpik,
        },
      });

      if (!member) {
        throw new Error(`No existe el miembro con ID EPIK ${idEpik}.`);
      }

      const committees = member.committees ?? [];

      if (committees.some((current) => current.id === committee.id)) {
        continue;
      }

      member.committees = [...committees, committee];

      await memberRepository.save(member);

      console.log(`"${member.fullName}" agregado a "${data.name}".`);
    }
  }
}

import { AppDataSource } from '../data-source.js';
import { GroupMember } from '../../groups/entities/group-member.entity.js';
import { Group } from '../../groups/entities/group.entity.js';
import { Member } from '../../members/entities/member.entity.js';
import { MemberStatus } from '../../groups/entities/member-status.entity.js';

// Todos los miembros sembrados quedan vinculados a un grupo: un miembro sin
// grupo no aparece en la interfaz pero sí ocupa su ID EPIK, correo y documento.
const MEMBERSHIPS = [
  { idEpik: 1001, groupName: 'SPIE', statusName: 'Activo' },
  { idEpik: 1002, groupName: 'SPIE', statusName: 'Período de prueba' },
];

export async function seedGroupMembers() {
  const repository = AppDataSource.getRepository(GroupMember);
  const groupRepository = AppDataSource.getRepository(Group);
  const memberRepository = AppDataSource.getRepository(Member);
  const statusRepository = AppDataSource.getRepository(MemberStatus);

  for (const data of MEMBERSHIPS) {
    const group = await groupRepository.findOne({
      where: {
        name: data.groupName,
      },
    });

    const member = await memberRepository.findOne({
      where: {
        idEpik: data.idEpik,
      },
    });

    const status = await statusRepository.findOne({
      where: {
        name: data.statusName,
        group: {
          id: group?.id,
        },
      },
    });

    if (!group || !member || !status) {
      throw new Error(
        'No se encontraron las entidades necesarias para GroupMember.',
      );
    }

    const existing = await repository.findOne({
      where: {
        member: {
          id: member.id,
        },
        group: {
          id: group.id,
        },
      },
    });

    if (existing) {
      console.log(`"${member.fullName}" ya pertenece a "${group.name}".`);
      continue;
    }

    const groupMember = repository.create({
      member,
      group,
      memberStatus: status,
    });

    await repository.save(groupMember);

    console.log(`"${member.fullName}" vinculado a "${group.name}".`);
  }
}

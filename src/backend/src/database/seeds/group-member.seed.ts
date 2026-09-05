import { AppDataSource } from '../data-source.js';
import { GroupMember } from '../../groups/entities/group-member.entity.js';
import { Group } from '../../groups/entities/group.entity.js';
import { Member } from '../../members/entities/member.entity.js';
import { MemberStatus } from '../../groups/entities/member-status.entity.js';

export async function seedGroupMembers() {
  const repository = AppDataSource.getRepository(GroupMember);

  const groupRepository = AppDataSource.getRepository(Group);
  const memberRepository = AppDataSource.getRepository(Member);
  const statusRepository = AppDataSource.getRepository(MemberStatus);

  const group = await groupRepository.findOne({
    where: {
      name: 'SPIE',
    },
  });

  const member = await memberRepository.findOne({
    where: {
      idEpik: 1001,
    },
  });

  const status = await statusRepository.findOne({
    where: {
      name: 'Activo',
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
    console.log('La relación GroupMember ya existe.');
    return;
  }

  const groupMember = repository.create({
    member,
    group,
    memberStatus: status,
  });

  await repository.save(groupMember);

  console.log('GroupMember creado.');
}

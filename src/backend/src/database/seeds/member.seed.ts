import { AppDataSource } from '../data-source.js';
import { Member } from '../../members/entities/member.entity.js';

export async function seedMembers() {
  const repository = AppDataSource.getRepository(Member);

  const membersData = [
    {
      idEpik: 1001,
      fullName: 'Juan Pérez',
      documentType: 'CC',
      documentNumber: '100000001',
      email: 'juan@example.com',
      phone: '3000000001',
      program: 'Ingeniería de Sistemas',
      secondProgram: '',
    },
    {
      idEpik: 1002,
      fullName: 'María Gómez',
      documentType: 'CC',
      documentNumber: '100000002',
      email: 'maria@example.com',
      phone: '3000000002',
      program: 'Administración',
      secondProgram: '',
    },
  ];

  for (const data of membersData) {
    const existing = await repository.findOne({
      where: {
        idEpik: data.idEpik,
      },
    });

    if (existing) {
      console.log(`Miembro "${existing.fullName}" ya existe.`);
      continue;
    }

    const member = repository.create(data);

    await repository.save(member);

    console.log(`Miembro "${member.fullName}" creado.`);
  }
}

import bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source.js';
import { User } from '../../users/entities/user.entity.js';
import { Group } from '../../groups/entities/group.entity.js';

export async function seedUsers() {
  const userRepository = AppDataSource.getRepository(User);
  const groupRepository = AppDataSource.getRepository(Group);

  const boardGroup = await groupRepository.findOne({
    where: {
      name: 'SPIE',
    },
  });

  if (!boardGroup) {
    throw new Error(
      'No se encontró el grupo para el usuario board.',
    );
  }

  const users = [
    {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      group: null,
    },
    {
      username: process.env.BOARD_USERNAME,
      password: process.env.BOARD_PASSWORD,
      role: 'board',
      group: boardGroup,
    },
  ];

  for (const data of users) {
    if (!data.username || !data.password) {
      throw new Error(
        `Faltan las credenciales para el usuario ${data.role}.`,
      );
    }

    const existingUser = await userRepository.findOne({
      where: {
        username: data.username,
      },
    });

    if (existingUser) {
      console.log(`Usuario "${data.username}" ya existe.`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = userRepository.create({
      username: data.username,
      password: hashedPassword,
      role: data.role,
      group: data.group,
    });

    await userRepository.save(user);

    console.log(`Usuario "${data.username}" creado.`);
  }
}

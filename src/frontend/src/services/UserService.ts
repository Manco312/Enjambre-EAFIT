import axios from 'axios';

import type { CreateUserDTO } from '@/dtos/CreateUserDTO';
import { ENVIRONMENT } from '@/constants/environment';

const USERS_URL = `${ENVIRONMENT.API_URL}/users`;

export class UserService {
  // Solo crea usuarios de junta. Ligado a un grupo
  // vía groupId.
  public static async createUser(dto: CreateUserDTO): Promise<void> {
    await axios.post(USERS_URL, {
      username: dto.username.trim(),
      password: dto.password,
      groupId: dto.groupId,
    });
  }
}

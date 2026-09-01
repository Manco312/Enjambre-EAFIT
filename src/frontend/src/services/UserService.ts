import type { CreateUserDTO } from '@/dtos/CreateUserDTO';
import type { Nullable } from '@/types/Nullable';
import type { UserInterface } from '@/interfaces/UserInterface';
import { USER_ROLES } from '@/constants/roles';
import { generateId } from '@/utils/generateId';
import { useUserStore } from '@/stores/userstore';

export class UserService {
  public static getUsers(): UserInterface[] {
    return useUserStore().users;
  }

  public static getUserById(id: number): Nullable<UserInterface> {
    return useUserStore().users.find((user: UserInterface) => user.id === id) ?? null;
  }

  public static getUserByUsername(username: string): Nullable<UserInterface> {
    const normalized = username.trim().toLowerCase();
    return (
      useUserStore().users.find(
        (user: UserInterface) => user.username.toLowerCase() === normalized,
      ) ?? null
    );
  }

  public static getBoardUserByGroupId(groupId: number): Nullable<UserInterface> {
    return (
      useUserStore().users.find(
        (user: UserInterface) => user.role === USER_ROLES.BOARD && user.groupId === groupId,
      ) ?? null
    );
  }

  public static usernameExists(username: string): boolean {
    return UserService.getUserByUsername(username) !== null;
  }

  public static createUser(dto: CreateUserDTO): UserInterface {
    const store = useUserStore();
    const user: UserInterface = {
      id: generateId(store.users),
      username: dto.username.trim(),
      password: dto.password,
      role: dto.role,
      groupId: dto.groupId,
    };
    store.addUser(user);
    return user;
  }

  public static deleteUser(id: number): void {
    useUserStore().removeUser(id);
  }

  public static deleteBoardUserByGroupId(groupId: number): void {
    const boardUser = UserService.getBoardUserByGroupId(groupId);
    if (boardUser !== null) {
      UserService.deleteUser(boardUser.id);
    }
  }
}

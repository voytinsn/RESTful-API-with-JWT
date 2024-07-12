// Битовая схема прав
export enum RightsBitmask {
  CREATE = 0x1000,
  READ = 0x0100,
  UPDATE = 0x0010,
  DELETE = 0x0001,
}

// Роли
export const roleAdmin = "admin";
export const roleReader = "reader";

// Маски прав по ролям
export class RolesMap {
  static admin: number =
    RightsBitmask.CREATE |
    RightsBitmask.READ |
    RightsBitmask.UPDATE |
    RightsBitmask.DELETE;

  static reader: number = RightsBitmask.READ;
}

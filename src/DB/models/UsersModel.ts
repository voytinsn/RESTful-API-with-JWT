import DbConnector from "../DbConnector";

export type User = {
  id: number;
  username: string;
  password: string;
};

export class UsersModel {
  static tableName: string = "users";

  /**
   * Находит в БД пользователя по его username
   *
   * @param username
   * @param dbConnector
   */
  static async getByUsername(
    username: string,
    dbConnector: DbConnector
  ): Promise<User | null> {
    const rows: User[] = await dbConnector.executeQuery<User>(`
            select *
            from ${UsersModel.tableName}
            where username = '${username}'
            limit 1
        `);

    if (rows.length === 1) {
      return rows[0];
    } else {
      return null;
    }
  }
}

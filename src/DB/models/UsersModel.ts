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
   */
  static async getByUsername(username: string): Promise<User | null> {
    const rows: User[] = await DbConnector.instance.executeQuery<User>(`
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

  /**
   * Создает таблицу users
   */
  static async initTable() {
    const query: string = `
      CREATE TABLE "${this.tableName}" (
        "id" serial NOT NULL,
        PRIMARY KEY ("id"),
        "username" character varying(64) NOT NULL,
        "password" character(64) NOT NULL
      );
    `;

    DbConnector.instance.executeNonQuery(query);
    console.log("table users created");
  }
}

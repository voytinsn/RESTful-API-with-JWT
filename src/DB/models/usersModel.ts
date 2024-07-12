import DbConnector from "../dbConnector";
import { createSHA256Hash } from "../../services/cryptoHelper";
import { roleAdmin } from "../../rights";

export type User = {
  id?: number;
  username: string;
  password?: string;
  email: string;
  role: string;
};

export class UsersModel {
  static tableName: string = "users";

  /**
   * Находит в БД пользователя по его username
   *
   * @param username
   */
  static async getByUsername(username: string): Promise<User | null> {
    const query: string = `
      select *
      from ${this.tableName}
      where username = '${username}'
    `;

    const rows: User[] = await DbConnector.instance.executeQuery<User>(query);

    if (rows.length === 1) {
      return rows[0];
    } else {
      return null;
    }
  }

  /**
   * Находит в БД пользователя по id
   *
   * @param username
   */
  static async getById(id: number): Promise<User | null> {
    const query: string = `
        select *
        from ${this.tableName}
        where id = ${id}
      `;

    const rows: User[] = await DbConnector.instance.executeQuery<User>(query);

    if (rows.length === 1) {
      return rows[0];
    } else {
      return null;
    }
  }

  /**
   * Создает в БД запись о пользователе
   *
   * @param user
   * @returns id созданного пользователя
   */
  static async addUser(user: User): Promise<number> {
    if (user.password === undefined) {
      throw new Error("password is not specified");
    }

    const passHash = createSHA256Hash(user.password);

    const query: string = `
      INSERT INTO "users" ("username", "password", "email", "role")
      VALUES ('${user.username}', '${passHash}', '${user.email}', '${roleAdmin}')
      RETURNING id;
    `;

    const rows: { id: number }[] = await DbConnector.instance.executeQuery<{
      id: number;
    }>(query);

    return rows[0].id;
  }

  /**
   * Создает таблицу users
   */
  static async initTable() {
    const query: string = `
      CREATE TABLE "${this.tableName}" (
        "id"       serial NOT NULL,
        "username" character varying(64) NOT NULL,
        "password" character(64) NOT NULL,
        "email"    character varying(128) NOT NULL,
        "role"     character varying(10) NOT NULL,
        PRIMARY KEY ("id")
      );
    `;

    DbConnector.instance.executeNonQuery(query);
    console.log(`table "${this.tableName}" created`);
  }
}

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

  /**
   * Находит в БД пользователя по его username
   *
   * @param username
   */
  static async getByUsername(username: string): Promise<User | null> {
    const query: string = `
      select *
      from ${this.tableName}
      where username = $1
    `;

    const rows: User[] = await DbConnector.instance.executeQuery<User>(query, [
      username,
    ]);

    if (rows.length === 1) {
      return rows[0];
    } else {
      return null;
    }
  }

  /**
   * Находит в БД пользователя по его email
   *
   * @param username
   */
  static async getByEmail(email: string): Promise<User | null> {
    const query: string = `
      select *
      from ${this.tableName}
      where email = $1
    `;

    const rows: User[] = await DbConnector.instance.executeQuery<User>(query, [
      email,
    ]);

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
        where id = $1
      `;

    const rows: User[] = await DbConnector.instance.executeQuery<User>(query, [
      id,
    ]);

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
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;

    const rows: { id: number }[] = await DbConnector.instance.executeQuery<{
      id: number;
    }>(query, [user.username, passHash, user.email, roleAdmin]);

    return rows[0].id;
  }

  /**
   * Обновляет запись о пользователе в БД, не затрагивает пароль
   *
   * @param book
   */
  static async updateUser(user: User): Promise<void> {
    const query: string = `
      UPDATE "${this.tableName}" 
      SET username=$1,
          email=$2,
          role=$3
      WHERE id=$4;
    `;

    return await DbConnector.instance.executeNonQuery(query, [
      user.username,
      user.email,
      user.role,
      user.id,
    ]); 
  }
}

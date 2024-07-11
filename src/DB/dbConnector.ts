import { Client, Configuration, connect, ResultRecord } from "ts-postgres";
import { UsersModel } from "./models/usersModel";

/**
 * Обеспечивает доступ к БД
 */
class DbConnector {
  Configuration: Configuration;

  /**
   * Механизм инстанса, позволяет из любого места
   * в приложении использовать один и тот же объект
   * для доступа к БД.
   */
  private static _instance: DbConnector;

  public static get instance(): DbConnector {
    if (this._instance === undefined) {
      const dbConnectConf: Configuration = {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT!),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      };

      this._instance = new DbConnector(dbConnectConf);
    }
    return this._instance;
  }

  constructor(configuration: Configuration) {
    this.Configuration = configuration;
  }

  async initTables(): Promise<void> {
    if (!(await this.checkTableExists(UsersModel.tableName))) {
      UsersModel.initTable();
    } else {
      console.log(`table "${UsersModel.tableName}" already exists`);
    }
  }

  async checkTableExists(tableName: string): Promise<boolean> {
    const query: string = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE  table_schema = 'public'
        AND    table_name   = '${tableName}'
      );
    `;

    let result: { exists: boolean }[] = await this.executeQuery<{
      exists: boolean;
    }>(query);
    return result[0].exists;
  }

  /**
   * Выполняет запрос и возвращает массив объектов,
   * соответствующих строкам результата выполнения запроса
   *
   * @param query
   * @returns
   */
  async executeQuery<T = ResultRecord>(query: string): Promise<T[]> {
    const client: Client = await connect(this.Configuration);

    try {
      const result = client.query<T>(query);

      let rows: Array<T> = [];

      for await (const obj of result) {
        rows.push(obj);
      }

      return rows;
    } finally {
      await client.end();
    }
  }

  /**
   * Выполняет запрос без возвращения результата
   *
   * @param query
   */
  async executeNonQuery(query: string): Promise<void> {
    const client: Client = await connect(this.Configuration);

    try {
      client.query(query);
    } finally {
      await client.end();
    }
  }
}

export default DbConnector;

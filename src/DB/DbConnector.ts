import { Client, Configuration, connect, ResultRecord } from "ts-postgres";

class DbConnector {
  Configuration: Configuration;

  constructor(configuration: Configuration) {
    this.Configuration = configuration;
  }

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
}

export default DbConnector;

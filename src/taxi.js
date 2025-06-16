
import { loadDb } from './config';

export class Taxi {
    async init() {
        this.db = await loadDb();
        this.conn = await this.db.connect();

        this.color = "green";
        this.table = 'taxi_2023';
    }
    async loadTaxi(months = 12) {
      if (!this.db || !this.conn) {
        throw new Error('Database not initialized. Please call init() first.');
      }

      if (this.tableLoaded) return;

      const files = [];

      for (let id = 1; id <= months; id++) {
        const sId = String(id).padStart(2, '0');
        const key = `Y2023M${sId}`;
        const url = `00 - data/${this.color}/${this.color}_tripdata_2023-${sId}.parquet`;

        const res = await fetch(url);
        await this.db.registerFileBuffer(key, new Uint8Array(await res.arrayBuffer()));

        files.push(key);
      }

      await this.conn.query(`
        CREATE TABLE ${this.table} AS
        SELECT * FROM read_parquet([${files.join(",")}]);
      `);

      this.tableLoaded = true;
    }


    async query(sql) {
        if (!this.db || !this.conn)
            throw new Error('Database not initialized. Please call init() first.');

        let result = await this.conn.query(sql);
        return result.toArray().map(row => row.toJSON());
    }

    async test(limit = 10) {
        if (!this.db || !this.conn)
            throw new Error('Database not initialized. Please call init() first.');

        const sql = `
                SELECT *
                FROM ${this.table}
                LIMIT ${limit}
            `;

        return await this.query(sql);
    }

    async queryCountByLocation(origin, limit = 10) {
        if (!this.db || !this.conn)
            throw new Error('Database not initialized. Please call init() first.');

        const sql = `
            SELECT DOLocationID, COUNT(*) AS count
            FROM
                taxi_2023
            WHERE
                PULocationID = '${origin}'
            GROUP BY
                DOLocationID
            LIMIT ${limit}
        `;

        return await this.query(sql);
    }

    async queryInfoByLocation(locationId) {
        if (!this.db || !this.conn)
            throw new Error('Database not initialized. Please call init() first.');

        const sql = `
            SELECT *
            FROM ${this.table}
            WHERE DOLocationID = '${locationId}'
        `;

        return await this.query(sql);
    }

}

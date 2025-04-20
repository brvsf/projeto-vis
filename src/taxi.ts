import { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';

import { loadDb } from './config';


export class Taxi {
    private db?: AsyncDuckDB;
    private conn?: AsyncDuckDBConnection;

    private color = "green";
    private table = 'taxi_2023';

    async init() {
        this.db = await loadDb();
        this.conn = await this.db.connect();
    }

    async loadTaxi(months: number = 3) {
        if (!this.db || !this.conn)
            throw new Error('Database not initialized. Please call init() first.');

        const files = [];

        for (let id = 1; id <= months; id++) {
            const sId = String(id).padStart(2, '0')
            files.push({ key: `Y2023M${sId}`, url: `data/${this.color}/${this.color}_tripdata_2023-${sId}.parquet` }); // Path para o arquivo parquet

            const res = await fetch(files[files.length - 1].url);
            await this.db.registerFileBuffer(files[files.length - 1].key, new Uint8Array(await res.arrayBuffer()));
        }

        await this.conn.query(`
            CREATE TABLE ${this.table} AS
                SELECT *
                FROM read_parquet([${files.map(d => d.key).join(",")}]);
        `);
    }

    async query(sql: string) {
        if (!this.db || !this.conn)
            throw new Error('Database not initialized. Please call init() first.');

        let result = await this.conn.query(sql);
        return result.toArray().map(row => row.toJSON());
    }

    async test(limit: number | undefined = undefined) {
        if (!this.db || !this.conn)
            throw new Error('Database not initialized. Please call init() first.');

        const sql = `
                SELECT *
                FROM ${this.table}
                LIMIT ${limit}
            `;

        return await this.query(sql);
    }

    async runs_per_day(limit: number | undefined = undefined) {
      if (!this.db || !this.conn)  // Check if db and conn are initialized
        throw new Error('Database not initialized. Please call init() first.');

      const sql = `
            SELECT
              date_part('day', lpep_pickup_datetime) AS day,
              COUNT(*) AS runs
            FROM ${this.table}
            GROUP BY day
            LIMIT ${limit}
          `;

        return await this.query(sql);
    }

    async mean_value_per_day(limit: number | undefined = undefined) {
      if (!this.db || !this.conn)
        throw new Error('Database not initialized. Please call init() first.');

      const sql = `
            SELECT
              date_part('day', lpep_pickup_datetime) AS day,
              AVG(total_amount) AS mean_value
            FROM ${this.table}
            GROUP BY day
            LIMIT ${limit}
          `;

        return await this.query(sql);

    }
}

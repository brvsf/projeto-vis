import { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';

import { loadDb } from './config';


export class Taxi {
    private db?: AsyncDuckDB;
    private conn?: AsyncDuckDBConnection;

    private color = "green";
    private table = 'taxi_2023';

    // This function is used to initialize the database connection and create a connection to the database
    async init() {
        this.db = await loadDb();
        this.conn = await this.db.connect();
    }

    private tableLoaded = false;

    // This function is used to load the taxi data from the database
    async loadTaxi(months: number = 1) {
        if (!this.db || !this.conn)
            throw new Error('Database not initialized. Please call init() first.');

        if (this.tableLoaded) return;


        const files = [];

        for (let id = 1; id <= months; id++) {
            const sId = String(id).padStart(2, '0')
            const key = `Y2023M${sId}`;
            const url = `data/${this.color}/${this.color}_tripdata_2023-${sId}.parquet`;

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

    // This function is used to load the data from the database and return it as an array of objects
    async query(sql: string) {
        if (!this.db || !this.conn)
            throw new Error('Database not initialized. Please call init() first.');

        let result = await this.conn.query(sql);
        return result.toArray().map(row => row.toJSON());
    }

    // This function is used to get the trip distance and tip amount from the database
    async trip_distance_per_tip_amount(limit: number | undefined = undefined, start_date: string | undefined = null, end_date: string | undefined = null) {
      if (!this.db || !this.conn)
        throw new Error('Database not initialized. Please call init() first.');

      const sql = `
        SELECT
          trip_distance,
          tip_amount,
          TO_TIMESTAMP(EXTRACT(EPOCH FROM lpep_pickup_datetime) / 1000) AS pickup_datetime
        FROM ${this.table}
        WHERE ('${start_date}' IS NULL OR lpep_pickup_datetime >= '${start_date}')
          AND ('${end_date}' IS NULL OR lpep_pickup_datetime <= '${end_date}')
        LIMIT ${limit || 100}
      `;

        return await this.query(sql);
    }


}

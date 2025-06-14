import { AsyncDuckDB } from '@duckdb/duckdb-wasm';
import { loadDb } from './config';

export class Taxi {
  constructor() {
    this.db = null;
    this.conn = null;
    this.color = "green";
    this.table = 'taxi_2023';
    this.tableLoaded = false;
  }

  async init() {
    this.db = await loadDb();
    this.conn = await this.db.connect();
  }

  async loadTaxi(months = 1) {
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
    if (!this.db || !this.conn) {
      throw new Error('Database not initialized. Please call init() first.');
    }

    let result = await this.conn.query(sql);
    return result.toArray().map(row => row.toJSON());
  }

  // Question 1
  async weekday_taxi_trips(limit = undefined) {
    if (!this.db || !this.conn) {
      throw new Error('Database not initialized. Please call init() first.');
    }

    const limitClause = limit ? `LIMIT ${limit}` : '';

    const sql = `
      SELECT
        CASE
          WHEN strftime(lpep_pickup_datetime, '%w') IN ('0', '6') THEN 1
          ELSE 0
        END AS is_weekend,
        COUNT(*) * 1.0 / COUNT(DISTINCT CAST(lpep_pickup_datetime AS DATE)) AS trips_per_day,
        AVG(tip_amount) AS avg_tip,
        AVG(trip_distance) AS avg_distance,
        AVG(passenger_count) AS avg_passengers,
        AVG(fare_amount) AS avg_fare,
        AVG(total_amount) AS avg_total
      FROM ${this.table}
      GROUP BY is_weekend
      ${limitClause};
    `;
    return await this.query(sql);
  }

  async weekday_trip_count(limit = undefined, month = "1") {
    if (!this.db || !this.conn) {
      throw new Error('Database not initialized. Please call init() first.');
    }

    const limitClause = limit ? `LIMIT ${limit}` : '';

    const sql = `
      SELECT
        CASE
          WHEN strftime(lpep_pickup_datetime, '%w') IN ('0', '6') THEN 1
          ELSE 0
        END AS is_weekend,
        strftime(lpep_pickup_datetime, '%w') AS weekday,
        COUNT(*) as trip_count,
      FROM ${this.table}
      WHERE strftime(lpep_pickup_datetime, '%d-%m-%y') >= '01-01-2023'
        AND strftime(lpep_pickup_datetime, '%d-%m-%y') <= '31-12-2023'
        AND strftime(lpep_pickup_datetime, '%m') = LPAD(CAST(${month} AS VARCHAR), 2, '0')
      GROUP BY weekday
      ORDER BY weekday
      ${limitClause};
    `;
    return await this.query(sql);
  }

  async weekday_variable(limit = undefined, variable = "tip_amount", month = "1") {
    if (!this.db || !this.conn) {
      throw new Error('Database not initialized. Please call init() first.');
    }

    const limitClause = limit ? `LIMIT ${limit}` : '';

    const sql = `
      SELECT
        CASE
          WHEN strftime(lpep_pickup_datetime, '%w') IN ('0', '6') THEN 1
          ELSE 0
        END AS is_weekend,
        strftime(lpep_pickup_datetime, '%w') AS weekday,
        ${variable}
      FROM ${this.table}
      WHERE strftime(lpep_pickup_datetime, '%d-%m-%y') >= '01-01-2023'
        AND strftime(lpep_pickup_datetime, '%d-%m-%y') <= '31-12-2023'
        AND strftime(lpep_pickup_datetime, '%m') = LPAD(CAST(${month} AS VARCHAR), 2, '0')
      -- GROUP BY weekday
      ORDER BY weekday
      ${limitClause};
    `;
    return await this.query(sql);
  }

  async month_data(limit = undefined, variable = "tip_amount", month = "1") {
    if (!this.db || !this.conn) {
      throw new Error('Database not initialized. Please call init() first.');
    }

    const limitClause = limit ? `LIMIT ${limit}` : '';

    const sql = `
      SELECT
        strftime(lpep_pickup_datetime, '%Y-%m-%d') AS date,
        AVG(${variable}) AS ${variable},
        CASE
          WHEN strftime(lpep_pickup_datetime, '%w') IN ('0', '6') THEN 1
          ELSE 0
        END AS is_weekend
      FROM ${this.table}
      WHERE strftime(lpep_pickup_datetime, '%Y') = '2023'
        AND strftime(lpep_pickup_datetime, '%m') = LPAD(CAST(${month} AS VARCHAR), 2, '0')
      GROUP BY
        strftime(lpep_pickup_datetime, '%Y-%m-%d'),
        strftime(lpep_pickup_datetime, '%w')
      ORDER BY date ASC
      ${limitClause};
    `;
    return await this.query(sql);
  }

  // Question 2
  async tip_amount_per_hour(aggregation = "COUNT") {
    if (!this.db || !this.conn) {
      throw new Error('Database not initialized. Please call init() first.');
    }

    const sql = `
      SELECT
        strftime(lpep_pickup_datetime, '%H') AS hour,
        ${aggregation}(tip_amount) AS tip
      FROM ${this.table}
      GROUP BY hour;`;
    return await this.query(sql);
  }
}

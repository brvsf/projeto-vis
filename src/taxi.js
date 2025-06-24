import { loadDb } from './config';

export class Taxi {
  async init() {
    this.db = await loadDb();
    this.conn = await this.db.connect();
    this.color = "green";
    this.table = 'taxi_2023';
  }

  async loadTaxi(months = 12) {
    if (!this.db || !this.conn) throw new Error('Database not initialized. Please call init() first.');
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
      SELECT * FROM ${this.table} LIMIT ${limit}
    `;
    return await this.query(sql);
  }

  async queryCountByLocation(idList) {
    if (!this.db || !this.conn)
      throw new Error('Database not initialized. Please call init() first.');

    const numericIds = idList.map(id => Number(id)).filter(id => !isNaN(id));
    const whereClause = numericIds.length > 0
      ? `WHERE PULocationID IN (${numericIds.join(',')})`
      : '';

    const sql = `
      SELECT DOLocationID, COUNT(*) AS count
      FROM ${this.table}
      ${whereClause}
      GROUP BY DOLocationID
    `;
    return await this.query(sql);
  }

  async queryInfoByLocation(idList, pickupDropoff = 'DOLocationID') {
    if (!this.db || !this.conn)
      throw new Error('Database not initialized. Please call init() first.');

    const numericIds = idList.map(id => Number(id)).filter(id => !isNaN(id));
    const whereClause = numericIds.length > 0
      ? `WHERE ${pickupDropoff} IN (${numericIds.join(',')})`
      : '';

    const sql = `
      SELECT *
      FROM ${this.table}
      ${whereClause}
    `;
    return await this.query(sql);
  }

  async queryInfoByDate(idList, variable = '*', aggregation = 'COUNT', pickupDropoff = 'DOLocationID') {
    if (!this.db || !this.conn)
      throw new Error('Database not initialized. Please call init() first.');

    const numericIds = idList.map(id => Number(id)).filter(id => !isNaN(id));
    const whereConditions = [`lpep_pickup_datetime BETWEEN '2023-01-01 00:00:00' AND '2023-12-31 23:59:59'`];

    if (numericIds.length > 0) {
      whereConditions.unshift(`${pickupDropoff} IN (${numericIds.join(',')})`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const sql = `
      SELECT
        strftime(lpep_pickup_datetime, '%Y-%m-%d') AS date,
        ${aggregation.toUpperCase()}(${variable}) AS value
      FROM ${this.table}
      ${whereClause}
      GROUP BY date
      ORDER BY date ASC
    `;
    return await this.query(sql);
  }

  async queryInfoByHour(variable = '*', aggregation = 'COUNT', start_date = '2023-01-01 00:00:00', end_date = '2023-12-31 23:59:59') {
    if (!this.db || !this.conn)
      throw new Error('Database not initialized. Please call init() first.');

    const sql = `
      SELECT
        strftime(lpep_pickup_datetime, '%Y-%m-%d %H:00:00') AS hour,
        ${aggregation.toUpperCase()}(${variable}) AS value
      FROM ${this.table}
      WHERE lpep_pickup_datetime BETWEEN '${start_date}' AND '${end_date}'
      GROUP BY hour
      ORDER BY hour ASC
    `;
    return await this.query(sql);
  }

  async queryFilteredAggregation({ locationIds = [], startDate, endDate, hours = [], groupBy = 'date' }) {
    if (!this.db || !this.conn)
      throw new Error('Database not initialized. Please call init() first.');

    const conditions = [];

    if (locationIds.length > 0) {
      conditions.push(`PULocationID IN (${locationIds.join(',')})`);
    }

    if (startDate && endDate) {
      conditions.push(`lpep_pickup_datetime BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'`);
    }

    if (hours.length > 0) {
      conditions.push(`CAST(strftime(lpep_pickup_datetime, '%H') AS INTEGER) IN (${hours.join(',')})`);
    }

    const groupCol = groupBy === 'hour'
      ? `strftime(lpep_pickup_datetime, '%Y-%m-%d %H:00:00')`
      : `strftime(lpep_pickup_datetime, '%Y-%m-%d')`;

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT ${groupCol} AS ${groupBy}, COUNT(*) AS value
      FROM ${this.table}
      ${whereClause}
      GROUP BY ${groupBy}
      ORDER BY ${groupBy}
    `;

    return await this.query(sql);
  }
}

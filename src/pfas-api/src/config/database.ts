/**
 * PostgreSQL database configuration for PFAS-Free Kitchen Platform API
 * Uses pg driver with connection pooling
 */

import pg from 'pg';
import { logger } from './logger.js';

const { Pool } = pg;

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean | { rejectUnauthorized: boolean };
  poolMin: number;
  poolMax: number;
}

export const databaseConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'pfas_kitchen',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
  poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
};

// Connection pool instance
let pool: pg.Pool | null = null;

/**
 * Get or create the connection pool
 */
function getPool(): pg.Pool {
  if (!pool) {
    pool = new Pool({
      host: databaseConfig.host,
      port: databaseConfig.port,
      database: databaseConfig.database,
      user: databaseConfig.user,
      password: databaseConfig.password,
      ssl: databaseConfig.ssl,
      min: databaseConfig.poolMin,
      max: databaseConfig.poolMax,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      logger.error({ err }, 'Unexpected database pool error');
    });

    pool.on('connect', () => {
      logger.debug('New database connection established');
    });
  }
  return pool;
}

/**
 * Database abstraction layer
 */
export const db = {
  /**
   * Execute a query and return all rows
   */
  async query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> {
    const client = getPool();
    const start = Date.now();
    
    try {
      const result = await client.query(sql, params);
      const duration = Date.now() - start;
      
      logger.debug({ 
        sql: sql.substring(0, 200), 
        params: params?.slice(0, 5), 
        rowCount: result.rowCount,
        duration 
      }, 'Database query executed');
      
      return result.rows as T[];
    } catch (err) {
      logger.error({ err, sql: sql.substring(0, 200), params }, 'Database query failed');
      throw err;
    }
  },

  /**
   * Execute a query and return single row
   */
  async queryOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] || null;
  },

  /**
   * Execute a query and return the count
   */
  async count(sql: string, params?: unknown[]): Promise<number> {
    const result = await this.queryOne<{ count: string }>(sql, params);
    return result ? parseInt(result.count, 10) : 0;
  },

  /**
   * Execute a transaction
   */
  async transaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
    const client = await getPool().connect();
    
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Execute a query within a transaction client
   */
  async queryWithClient<T = Record<string, unknown>>(
    client: pg.PoolClient,
    sql: string, 
    params?: unknown[]
  ): Promise<T[]> {
    const result = await client.query(sql, params);
    return result.rows as T[];
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.queryOne('SELECT 1');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Close pool
   */
  async close(): Promise<void> {
    if (pool) {
      await pool.end();
      pool = null;
      logger.info('Database pool closed');
    }
  },
};

/**
 * Initialize database connection
 */
export async function initDatabase(): Promise<void> {
  logger.info({
    host: databaseConfig.host,
    port: databaseConfig.port,
    database: databaseConfig.database,
    poolMax: databaseConfig.poolMax,
  }, 'Initializing database connection');

  // Test the connection
  const healthy = await db.healthCheck();
  if (!healthy) {
    throw new Error('Failed to connect to database');
  }
  
  logger.info('Database connection established');
}

export type { pg };

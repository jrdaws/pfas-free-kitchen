/**
 * Logger configuration for PFAS-Free Kitchen Platform API
 */

import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    service: 'pfas-api',
    version: process.env.npm_package_version || '0.1.0',
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token'],
    remove: true,
  },
});

export type Logger = typeof logger;

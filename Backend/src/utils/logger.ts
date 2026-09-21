import pino from 'pino';
import pretty from 'pino-pretty';

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

export const logger = isProduction
    ? pino({
          level: logLevel,
          timestamp: pino.stdTimeFunctions.isoTime,
      })
    : pino(
          {
              level: logLevel,
          },
          pretty({
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
              singleLine: true,
          })
      );

export default logger;

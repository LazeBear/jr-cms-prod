/* eslint-disable no-param-reassign */
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

const env = process.env.NODE_ENV;
if (!process.env.PWD) {
  process.env.PWD = process.cwd();
}
const logDirectory = path.join(process.env.PWD, 'logs');
const errorDirectory = path.join(logDirectory, 'errors');

// eslint-disable-next-line no-unused-expressions
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// eslint-disable-next-line no-unused-expressions
fs.existsSync(errorDirectory) || fs.mkdirSync(errorDirectory);

const logFile = new transports.DailyRotateFile({
  dirname: 'logs',
  filename: '%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  frequency: '1d',
  zippedArchive: true,
  maxSize: '5m',
  maxFiles: '10d'
});

const errorFile = new transports.DailyRotateFile({
  dirname: 'logs/errors',
  filename: '%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '5m',
  maxFiles: '10d',
  level: 'error'
});

const enumerateErrorFormat = format(info => {
  if (info.message instanceof Error) {
    info.message = Object.assign(
      {
        message: info.message.message,
        stack: info.message.stack
      },
      info.message
    );
  }

  if (info instanceof Error) {
    return Object.assign(
      {
        message: info.message,
        stack: info.stack
      },
      info
    );
  }

  return info;
});

const loggerFormat = {
  colorize: format.colorize(),
  timestampConsole: format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  timestampFile: format.timestamp(),
  print: format.printf(
    info =>
      `${info.timestamp} [${info.level}]: "${info.message}" ${
        info.stack ? info.stack : ''
      }`
  )
};

const consoleFormat = format.combine(
  enumerateErrorFormat(),
  loggerFormat.colorize,
  loggerFormat.timestampConsole,
  loggerFormat.print
);

const fileFormat = format.combine(
  enumerateErrorFormat(),
  loggerFormat.timestampFile,
  loggerFormat.print
);

const logger = createLogger({
  level: env === 'production' ? 'info' : 'debug',
  format: fileFormat,
  transports: [
    new transports.Console({ format: consoleFormat }),
    logFile,
    errorFile
  ]
});

// for morgan
logger.stream = {
  write: message => {
    logger.info(message.trim());
  }
};

module.exports = logger;

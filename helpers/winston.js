const winston = require('winston');

let logger = null;
const stackDriverLevels = {
  levels: {
    emergency: 0,
    alert: 1,
    critical: 2,
    error: 3,
    warning: 4,
    notice: 5,
    info: 6,
    debug: 7,
  },
  colors: {
    error: 'red',
    warning: 'yellow',
    info: 'green',
    notice: 'blue',
    debug: 'gray',
  },
};

winston.addColors(stackDriverLevels.colors);

const getLogger = () => {
  if (logger) {
    return logger;
  }

  logger = winston.createLogger({
    level: 'debug',
    levels: stackDriverLevels.levels,
    transports: [
      new winston.transports.Console({
        stderrLevels: ['emergency', 'alert', 'critical', 'error', 'warning'],
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'DD-MM-YYYY hh:mm:ss A' }),
          winston.format.errors({ stack: true }),
          winston.format.printf(({ level, message, timestamp, stack }) => {
            if (stack) {
              return `${timestamp} ${level}: ${message} - ${stack}`;
            }
            return `${timestamp} ${level}: ${message}`;
          }),
        ),
        handleExceptions: true,
      }),
    ],
    exitOnError: false,
  });

  if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
    logger.add(
      new winston.transports.File({
        filename: '/var/log/enormoqb.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
        handleExceptions: true,
        level: 'debug',
        tailable: false,
        maxFiles: 1,
        maxsize: 2097152,
      }),
    );
  }

  logger.stream = {
    write: (message, encoding) => {
      logger.info(message);
    },
  };

  return logger;
};

/**
 * @type {winston.Logger}
 */
module.exports = getLogger();

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = languramaLog;
exports.error = error;
exports.warn = warn;
exports.info = info;
exports.debug = debug;
exports.trace = trace;
exports.logLevels = exports.defaultFileConfiguration = exports.defaultTerminalConfiguration = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Native modules.
////////////////////////////////////////////////////////////////////////////////
// Check if this package is being used in the browser or not.
const isBrowser = typeof window === 'undefined' ? false : true; // Check if this package is in development mode.

const isDev = process.argv.reduce(function (value, argument) {
  /* istanbul ignore next */
  if (value || argument === '--dev') return true;
  return false;
}, false); ////////////////////////////////////////////////////////////////////////////////
// Used for debugging this package.

/* istanbul ignore next */

function devLog(...messages) {
  if (isDev) console.log('[@langurama/log]', ...messages);
}

function createLogsDirectory(logsDirPath) {
  if (!_fs.default.existsSync(logsDirPath)) {
    devLog(`Creating log directory: ${logsDirPath}`);

    _fs.default.mkdirSync(logsDirPath, {
      recursive: true
    });
  } else {
    devLog(`Log directory already existed: ${logsDirPath}`);
  }
}

function getTimestamp(date) {
  let year = date.getFullYear().toString();
  const origMonth = date.getMonth() + 1;
  const month = origMonth.toString().length === 1 ? `0${origMonth}` : origMonth;
  const origDay = date.getDate();
  const day = origDay.toString().length === 1 ? `0${origDay}` : origDay;
  const origHours = date.getHours();
  const hours = origHours.toString().length === 1 ? `0${origHours}` : origHours;
  const origMinutes = date.getMinutes();
  const minutes = origMinutes.toString().length === 1 ? `0${origMinutes}` : origMinutes;
  const origSeconds = date.getSeconds();
  const seconds = origSeconds.toString().length === 1 ? `0${origSeconds}` : origSeconds;
  const origOffsetUTC = date.getTimezoneOffset() / 60;
  const offsetUTC = origOffsetUTC > 0 ? `-${origOffsetUTC}` : `+${origOffsetUTC * -1}`;
  const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC${offsetUTC}`;
  return timestamp;
}

function formatMessages(chalk, ...messages) {
  const message = messages.reduce((message, argument) => {
    let newMessage;

    if (message === '') {
      newMessage = message;
    } else {
      newMessage = `${message} `;
    }

    if (argument === undefined) {
      if (chalk !== undefined) {
        newMessage += chalk.blue('undefined');
      } else {
        newMessage += 'undefined';
      }
    } else if (argument === null) {
      if (chalk !== undefined) {
        newMessage += chalk.blue('null');
      } else {
        newMessage += 'null';
      }
    } else if (argument.constructor === Array) {
      if (chalk !== undefined) {
        newMessage += chalk.green(`[${argument.toString()}]`);
      } else {
        newMessage += `[${argument.toString()}]`;
      }
    } else if (argument.constructor === Symbol) {
      newMessage += String(argument); // TODO: Remove disable rule when BigInt exists.
      // eslint-disable-next-line no-undef
    } else if (argument.constructor === BigInt) {
      newMessage += argument.toString();
    } else if (argument.constructor === Number) {
      if (chalk !== undefined) {
        newMessage += chalk.green(argument.toString());
      } else {
        newMessage += argument.toString();
      }
    } else if (argument.constructor === Boolean) {
      if (chalk !== undefined) {
        newMessage += chalk.yellow(argument.toString());
      } else {
        newMessage += argument.toString();
      }
    } else if (argument.constructor === Error) {
      if (chalk !== undefined) {
        newMessage += argument.stack.split('\n').map(line => {
          if (line.indexOf('(internal/') === -1) return chalk.red(line);
          return chalk.grey(line);
        }).join('\n');
      } else {
        newMessage += argument.stack;
      }
    } else if (argument.constructor === Object) {
      newMessage += JSON.stringify(argument, null, 4);
    } else {
      // String or unknown.
      newMessage += argument.toString();
    }

    return newMessage;
  }, '');
  devLog(`Formatted message: ${message}`);
  return message;
}

function getCallee(chalk) {
  const object = {};
  Error.captureStackTrace(object);
  const stack = object.stack.split('\n')[7].split('(')[1].split(')')[0];
  if (chalk !== undefined) return chalk.grey(stack);
  return stack;
}

function createTerminalTransport(configuration) {
  const shouldIncludeCallee = configuration.callee;
  const shouldUseChalk = configuration.chalk !== undefined;
  return function terminalTransport(date, level, ...messages) {
    devLog('Terminal transport:', date, level, messages);
    devLog('Checking log level configuration level for terminal transport.');
    if (logLevels[level.toLowerCase()] > logLevels[configuration.level]) return;
    const timestamp = getTimestamp(date);
    devLog('Terminal should use chalk:', shouldUseChalk);

    if (level === 'ERROR') {
      devLog('Terminal ERROR hit.');
      const timestampAndLevel = shouldUseChalk ? `${configuration.chalk.grey(timestamp)}  ${configuration.chalk.bgBlack(configuration.chalk.bgRed.white(configuration.chalk.bold(level)))}` : `${timestamp}  ${level}`;
      isBrowser ? console.error(`${timestampAndLevel}`, ...messages, shouldIncludeCallee ? getCallee(configuration.chalk) : '') : process.stderr.write(`${timestampAndLevel} ${formatMessages(configuration.chalk, ...messages)} ${shouldIncludeCallee ? getCallee(configuration.chalk) : '' + '\n'}` + '\n');
    } else if (level === 'WARN') {
      devLog('Terminal WARN hit.');
      const timestampAndLevel = shouldUseChalk ? `${configuration.chalk.grey(timestamp)}   ${configuration.chalk.bgYellow(configuration.chalk.bgYellow.black(configuration.chalk.bold(level)))}` : `${timestamp}  ${level}`;
      isBrowser ? console.warn(`${timestampAndLevel}`, ...messages, shouldIncludeCallee ? getCallee(configuration.chalk) : '') : process.stderr.write(`${timestampAndLevel} ${formatMessages(configuration.chalk, ...messages)} ${shouldIncludeCallee ? getCallee(configuration.chalk) : '' + '\n'}` + '\n');
    } else if (level === 'INFO') {
      devLog('Terminal INFO hit.');
      const timestampAndLevel = shouldUseChalk ? `${configuration.chalk.grey(timestamp)}   ${configuration.chalk.white(level)}` : `${timestamp}  ${level}`;
      isBrowser ? console.info(`${timestampAndLevel}`, ...messages, shouldIncludeCallee ? getCallee(configuration.chalk) : '') : process.stdout.write(`${timestampAndLevel} ${formatMessages(configuration.chalk, ...messages)} ${shouldIncludeCallee ? getCallee(configuration.chalk) : '' + '\n'}` + '\n');
    } else if (level === 'DEBUG') {
      devLog('Terminal DEBUG hit.');
      const timestampAndLevel = shouldUseChalk ? `${configuration.chalk.grey(timestamp)}  ${configuration.chalk.cyan(level)}` : `${timestamp}  ${level}`;
      isBrowser ? console.debug(`${timestampAndLevel}`, ...messages, shouldIncludeCallee ? getCallee(configuration.chalk) : '') : process.stdout.write(`${timestampAndLevel} ${formatMessages(configuration.chalk, ...messages)} ${shouldIncludeCallee ? getCallee(configuration.chalk) : '' + '\n'}` + '\n'); // TODO: When https://github.com/gotwarlost/istanbul/issues/781s is fixed, turn next line into else if for TRACE.
    } else {
      devLog('Terminal TRACE hit.');
      const timestampAndLevel = shouldUseChalk ? `${configuration.chalk.grey(timestamp)}  ${configuration.chalk.green(level)}` : `${timestamp}  ${level}`;
      isBrowser ? console.trace(`${timestampAndLevel}`, ...messages, shouldIncludeCallee ? getCallee(configuration.chalk) : '') : process.stdout.write(`${timestampAndLevel} ${formatMessages(configuration.chalk, ...messages)} ${shouldIncludeCallee ? getCallee(configuration.chalk) : '' + '\n'}` + '\n');
    }

    return;
  };
}

function createFileTransport(configuration) {
  const shouldIncludeCallee = configuration.callee === false ? false : true;
  const shouldJsonFormat = configuration.json === true ? true : false; // File path.
  // prettier-ignore

  const isAnAbsolutePath = configuration.path.startsWith('/') // Linux/macOS.
  || configuration.path.substring(1).startsWith(':/'); // Windows.

  devLog(`Is absolute path: ${isAnAbsolutePath}`); // prettier-ignore

  const logDirectoryPathTmp = configuration.path.split('/');
  logDirectoryPathTmp.pop();
  const logDirectoryPath = logDirectoryPathTmp.join('/');
  devLog(`Log directory path: ${logDirectoryPath}`);
  const absoluteLogDirectoryPath = isAnAbsolutePath ? logDirectoryPath : _path.default.join(process.cwd(), logDirectoryPath);
  createLogsDirectory(absoluteLogDirectoryPath);
  const absoluteFilePath = isAnAbsolutePath ? configuration.path : _path.default.join(process.cwd(), configuration.path);
  devLog(`Absolute file path: ${absoluteFilePath}`); // File transport.

  return function fileTransport(date, level, ...messages) {
    devLog('File transport:', date, level, messages);
    devLog('Checking log level configuration level for file transport.');
    if (logLevels[level.toLowerCase()] > logLevels[configuration.level]) return;
    const timestamp = getTimestamp(date);
    const message = formatMessages(undefined, ...messages);
    const log = shouldJsonFormat ? shouldIncludeCallee ? `${JSON.stringify({
      timestamp,
      level,
      message,
      callee: getCallee()
    })}\n` : `${JSON.stringify({
      timestamp,
      level,
      message
    })}\n` : shouldIncludeCallee ? `${timestamp} ${level} ${message} ${getCallee()}\n` : `${timestamp} ${level} ${message}\n`;
    devLog(`Logging to file: ${log}`);

    _fs.default.appendFileSync(absoluteFilePath, log);
  };
}

const defaultTerminalConfiguration = {
  type: 'terminal',
  level: 'info',
  callee: true,
  chalk: undefined
};
exports.defaultTerminalConfiguration = defaultTerminalConfiguration;
const defaultFileConfiguration = {
  type: 'file',
  level: 'info',
  callee: false,
  path: './log/application.log',
  json: false
};
exports.defaultFileConfiguration = defaultFileConfiguration;
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
};
exports.logLevels = logLevels;

function validateConfiguration(userConfiguration) {
  const isObjectAndNotNull = typeof userConfiguration === 'object' && userConfiguration !== null;
  if (!isObjectAndNotNull) throw new Error(`"terminal" or "file" configuration must be of type "object". Received: ${JSON.stringify(userConfiguration)}`);
  const isTerminalConfiguration = userConfiguration.type === 'terminal';
  const isFileConfiguration = userConfiguration.type === 'file'; // Must be of file type "file" or "terminal".

  const validConfigurationType = userConfiguration.type !== undefined && (isTerminalConfiguration || isFileConfiguration);

  if (!validConfigurationType) {
    throw new Error(`Invalid configuration value for the property "type": ${userConfiguration.type}`);
  } // If in browser, "terminal" type is only allowed.


  if (isBrowser && isFileConfiguration) {
    throw new Error('Browser may not have a file configuration, it may only include a terminal configuration.');
  }

  const defaultTerminalConfigurationKeys = Object.keys(defaultTerminalConfiguration);
  const defaultFileConfigurationKeys = Object.keys(defaultFileConfiguration);
  const incorrectProperties = Object.keys(userConfiguration).filter(key => {
    if (isTerminalConfiguration) return !defaultTerminalConfigurationKeys.includes(key);
    return !defaultFileConfigurationKeys.includes(key);
  });
  if (incorrectProperties.length > 0) throw new Error(`Unknown properties found, remove them: ${incorrectProperties}`); // Check properties shared by both are correct.

  if (userConfiguration.level && typeof userConfiguration.level !== 'string') throw new Error('Invalid configuration value for the property "level" must be of type "string".');
  if (userConfiguration.level && logLevels[userConfiguration.level] === undefined) throw new Error(`Invalid configuration value for the property "level" must be one of the following: ${Object.keys(logLevels)}`);
  if (userConfiguration.callee && typeof userConfiguration.callee !== 'boolean') throw new Error('Invalid configuration value for the property "callee" must be of type "boolean".');
  if (userConfiguration.json && typeof userConfiguration.json !== 'boolean') throw new Error('Invalid configuration value for the property "json" must be of type "boolean".'); // If chalk is defined make sure it's of correct type.

  const chalkIsNotUndefinedButIsIncorrect = userConfiguration.chalk !== undefined && userConfiguration.chalk.constructor !== undefined && Object.getPrototypeOf(userConfiguration.chalk).constructor.name !== 'Chalk';

  if (chalkIsNotUndefinedButIsIncorrect) {
    throw new Error('Configuration value for property "chalk" must be of instance "Chalk".');
  }
} ////////////////////////////////////////////////////////////////////////////////


function languramaLog(userConfigurationOrConfigurations) {
  devLog('Recieved user configuration or configurations:', userConfigurationOrConfigurations); ////////////////////////////////////////////////////////////////////////////////
  // Validate configuration.

  devLog('Validating user configuration.'); // Check if it is undefined, an array or a single object.

  const isUndefined = userConfigurationOrConfigurations === undefined;
  const isArray = !isUndefined && Array.isArray(userConfigurationOrConfigurations);
  const isObjectAndNotNull = typeof userConfigurationOrConfigurations === 'object' && userConfigurationOrConfigurations !== null;
  const isNotUndefinedOrArrayOrObject = !isUndefined && !isArray && !isObjectAndNotNull;

  if (isNotUndefinedOrArrayOrObject) {
    // Invalid configuration type.
    throw new Error('Configuration must be of type "object" or an "array" of "objects".');
  } // Convert single object into array.


  const userConfigurations = isUndefined ? [defaultTerminalConfiguration] // undefined
  : isObjectAndNotNull && !isArray ? [userConfigurationOrConfigurations] // {}
  : userConfigurationOrConfigurations; // [{}, {}]
  // All of the configurations check out. Check if there is more than one terminal configuration.

  let numberOfTerminalConfigurations = 0;
  const configurations = userConfigurations.map(function validateAndCompleteUserConfiguration(configuration) {
    // Validate.
    validateConfiguration(configuration);
    const isTerminalConfiguration = configuration.type === 'terminal';

    if (isTerminalConfiguration) {
      numberOfTerminalConfigurations += 1;
      const tooManyTerminalConfigurations = numberOfTerminalConfigurations > 1;
      if (tooManyTerminalConfigurations) throw new Error(`Only one configuration terminal may be included. Number of configurations found: ${numberOfTerminalConfigurations}`); // Complete.

      return { ...defaultTerminalConfiguration,
        ...configuration
      };
    } else {
      // Complete.
      return { ...defaultFileConfiguration,
        ...configuration
      };
    }
  });
  devLog('User configuration has been validated. Configurations:', JSON.stringify(configurations)); ////////////////////////////////////////////////////////////////////////////////

  devLog('Creating transports.');
  const transports = [];
  configurations.map(configuration => {
    if (configuration.type === 'terminal') {
      // Create and add transport.
      transports.push(createTerminalTransport(configuration));
    } else {
      // Create and add transport.
      transports.push(createFileTransport(configuration));
    }

    return;
  });
  devLog(`Transports created. Amount of transports: ${transports.length}`); ////////////////////////////////////////////////////////////////////////////////

  devLog('Creating log instance.');
  const log = {
    error: (...messages) => {
      const date = new Date();
      error(date, transports, ...messages);
    },
    warn: (...messages) => {
      const date = new Date();
      warn(date, transports, ...messages);
    },
    info: (...messages) => {
      const date = new Date();
      info(date, transports, ...messages);
    },
    debug: (...messages) => {
      const date = new Date();
      debug(date, transports, ...messages);
    },
    trace: (...messages) => {
      const date = new Date();
      trace(date, transports, ...messages);
    },
    _configurations: configurations,
    _transports: transports
  };
  devLog('Log instance created.'); ////////////////////////////////////////////////////////////////////////////////

  return log;
} ////////////////////////////////////////////////////////////////////////////////


function error(date, transports, ...messages) {
  devLog('error messages:', messages);
  transports.forEach(func => func(date, 'ERROR', ...messages));
}

function warn(date, transports, ...messages) {
  devLog('warn messages:', messages);
  transports.forEach(func => func(date, 'WARN', ...messages));
}

function info(date, transports, ...messages) {
  devLog('info messages:', messages);
  transports.forEach(func => func(date, 'INFO', ...messages));
}

function debug(date, transports, ...messages) {
  devLog('debug messages:', messages);
  transports.forEach(func => func(date, 'DEBUG', ...messages));
}

function trace(date, transports, ...messages) {
  devLog('trace messages:', messages);
  transports.forEach(func => func(date, 'TRACE', ...messages));
}
//# sourceMappingURL=index.js.map
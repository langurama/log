// Native modules.
import { default as fs } from 'fs';
import { default as path } from 'path';

////////////////////////////////////////////////////////////////////////////////

// Check if this package is being used in the browser or not.
const isBrowser = typeof window === 'undefined' ? false : true;

// Check if this package is in development mode.
const isDev = process.argv.reduce(function(value, argument) {
    if (value || argument === '--dev') return true;
    return false;
}, false);

////////////////////////////////////////////////////////////////////////////////

// Used for debugging this package.
function devLog(...messages) {
    if (isDev) {
        console.log('[@basickarl/log]', ...messages);
    }
}

function createLogsDirectory(logsDirPath) {
    if (!fs.existsSync(logsDirPath)) {
        fs.mkdirSync(logsDirPath);
    }
}

function getTimestamp(date) {
    let year = date.getFullYear().toString();

    let month = (date.getMonth() + 1).toString();
    if (month.length === 1) {
        month = `0${month}`;
    }

    let day = date.getDate().toString();
    if (day.length === 1) {
        day = `0${day}`;
    }

    let hours = date.getHours().toString();
    if (hours.length === 1) {
        hours = `0${hours}`;
    }

    let minutes = date.getMinutes().toString();
    if (minutes.length === 1) {
        minutes = `0${minutes}`;
    }

    let seconds = date.getSeconds().toString();
    if (seconds.length === 1) {
        seconds = `0${seconds}`;
    }

    let offsetUTC = date.getTimezoneOffset() / 60;
    if (offsetUTC > 0) {
        offsetUTC = `-${offsetUTC}`;
    } else {
        offsetUTC = `+${offsetUTC * -1}`;
    }

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
                newMessage += chalk.green(argument.toString());
            } else {
                newMessage += argument.toString();
            }
        } else if (argument.constructor === String) {
            newMessage += argument;
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
                newMessage += argument.stack
                    .split('\n')
                    .map(line => {
                        if (line.indexOf('(internal/modules') === -1) return chalk.red(line);
                        return chalk.grey(line);
                    })
                    .join('\n');
            } else {
                newMessage += argument.stack;
            }
        } else if (argument.constructor === Object) {
            newMessage += JSON.stringify(argument, null, 4);
        } else {
            newMessage += argument.toString();
        }

        return newMessage;
    }, '');

    return message;
}

function getCallee(chalk) {
    const stack = new Error().stack
        .split('\n')[7]
        .split('(')[1]
        .split(')')[0];
    if (chalk !== undefined) return chalk.grey(stack);
    return stack;
}

function createTerminalTransport(configuration) {
    const shouldIncludeCallee = configuration.callee;
    const shouldUseChalk = configuration.chalk !== undefined;

    return function terminalTransport(date, level, messages) {
        devLog('Terminal transport:', date, level, messages);

        const timestamp = getTimestamp(date);

        devLog('Terminal should use chalk:', shouldUseChalk);

        if (level === 'ERROR') {
            devLog('Terminal ERROR hit.');
            const timestampAndLevel = shouldUseChalk
                ? `${configuration.chalk.grey(timestamp)}  ${configuration.chalk.bgBlack(
                      configuration.chalk.bgRed.white(configuration.chalk.bold(level))
                  )}`
                : `${timestamp}  ${level}`;
            isBrowser
                ? console.error(
                      `${timestampAndLevel}`,
                      ...messages,
                      shouldIncludeCallee ? getCallee(configuration.chalk) : ''
                  )
                : process.stderr.write(
                      `${timestampAndLevel} ${formatMessages(configuration.chalk, ...messages)} ${
                          shouldIncludeCallee ? getCallee(configuration.chalk) : '' + '\n'
                      }` + '\n'
                  );
        } else if (level === 'WARN') {
            devLog('Terminal WARN hit.');
            const timestampAndLevel = shouldUseChalk
                ? `${configuration.chalk.grey(timestamp)}   ${configuration.chalk.bgYellow(
                      configuration.chalk.bgYellow.black(configuration.chalk.bold(level))
                  )}`
                : `${timestamp}  ${level}`;
            isBrowser
                ? console.warn(
                      `${timestampAndLevel}`,
                      ...messages,
                      shouldIncludeCallee ? getCallee(configuration.chalk) : ''
                  )
                : process.stderr.write(
                      `${timestampAndLevel} ${formatMessages(configuration.chalk, ...messages)} ${
                          shouldIncludeCallee ? getCallee(configuration.chalk) : '' + '\n'
                      }` + '\n'
                  );
        } else if (level === 'INFO') {
            devLog('Terminal INFO hit.');
            const timestampAndLevel = shouldUseChalk
                ? `${configuration.chalk.grey(timestamp)}   ${configuration.chalk.white(level)}`
                : `${timestamp}  ${level}`;
            isBrowser
                ? console.info(
                      `${timestampAndLevel}`,
                      ...messages,
                      shouldIncludeCallee ? getCallee(configuration.chalk) : ''
                  )
                : process.stdout.write(
                      `${timestampAndLevel} ${formatMessages(configuration.chalk, ...messages)} ${
                          shouldIncludeCallee ? getCallee(configuration.chalk) : '' + '\n'
                      }` + '\n'
                  );
        } else if (level === 'DEBUG') {
            devLog('Terminal DEBUG hit.');
            const timestampAndLevel = shouldUseChalk
                ? `${configuration.chalk.grey(timestamp)}  ${configuration.chalk.cyan(level)}`
                : `${timestamp}  ${level}`;
            isBrowser
                ? console.debug(
                      `${timestampAndLevel}`,
                      ...messages,
                      shouldIncludeCallee ? getCallee(configuration.chalk) : ''
                  )
                : process.stdout.write(
                      `${timestampAndLevel} ${formatMessages(configuration.chalk, ...messages)} ${
                          shouldIncludeCallee ? getCallee(configuration.chalk) : '' + '\n'
                      }` + '\n'
                  );
        } else if (level === 'TRACE') {
            devLog('Terminal TRACE hit.');
            const timestampAndLevel = shouldUseChalk
                ? `${configuration.chalk.grey(timestamp)}  ${configuration.chalk.green(level)}`
                : `${timestamp}  ${level}`;
            isBrowser
                ? console.trace(
                      `${timestampAndLevel}`,
                      ...messages,
                      shouldIncludeCallee ? getCallee(configuration.chalk) : ''
                  )
                : process.stdout.write(
                      `${timestampAndLevel} ${formatMessages(configuration.chalk, ...messages)} ${
                          shouldIncludeCallee ? getCallee(configuration.chalk) : '' + '\n'
                      }` + '\n'
                  );
        }
        return;
    };
}

function createFileTransport(configuration) {
    const shouldIncludeCallee = configuration.callee === false ? false : true;
    const shouldJsonFormat = configuration.json === true ? true : false;
    // prettier-ignore
    const isAnAbsolutePath =
        configuration.path.startsWith('/') // Linux/macOS
        || configuration.path.substring(1).startsWith(':/'); // Windows
    // prettier-ignore
    const logPathTmp = configuration.path.split('/');
    logPathTmp.pop();
    const logPath = logPathTmp.join('/');
    let absolutePath;
    if (isAnAbsolutePath) {
        // Absolute path
        absolutePath = logPath;
    } else {
        // Relative Path
        absolutePath = path.join(__dirname, logPath);
    }
    createLogsDirectory(absolutePath);
    return function fileTransport(date, level, messages) {
        const timestamp = getTimestamp(date);

        let string;
        if (shouldIncludeCallee) {
            string = `${formatMessages(messages)} ${getCallee()}`;
        } else {
            string = formatMessages(messages);
        }

        let log;
        if (shouldJsonFormat) {
            // JSON
            log = JSON.stringify(`${timestamp} ${level} ${string}\n`);
        } else {
            // Text
            log = `${timestamp} ${level} ${string}\n`;
        }

        fs.appendFileSync(absolutePath, log);
    };
}

export const defaultTerminalConfiguration = {
    type: 'terminal',
    level: 'info',
    callee: true,
    chalk: undefined
};

export const defaultFileConfiguration = {
    type: 'file',
    level: 'info',
    callee: true,
    path: './info.log',
    json: false
};

function validateConfiguration(userConfiguration) {
    // Validate if it is an object.
    const isObjectAndNotNull = typeof userConfiguration === 'object' && userConfiguration !== null;
    if (!isObjectAndNotNull)
        throw new Error('"terminal" or "file" configuration must be of type "object".');

    const isTerminalConfiguration = userConfiguration.type === 'terminal';
    const isFileConfiguration = userConfiguration.type === 'file';

    // Must be of file type "file" or "terminal".
    const validConfigurationType =
        userConfiguration.type !== undefined && (isTerminalConfiguration || isFileConfiguration);
    if (!validConfigurationType) {
        throw new Error(
            `Invalid configuration value for the property "type": ${userConfiguration.type}`
        );
    }

    // If in browser, "terminal" type is only allowed.
    if (isBrowser && isFileConfiguration) {
        throw new Error(
            'Browser may not have a file configuration, it may only include a terminal configuration.'
        );
    }

    const defaultTerminalConfigurationKeys = Object.keys(defaultTerminalConfiguration);
    const defaultFileConfigurationKeys = Object.keys(defaultFileConfiguration);
    const incorrectProperties = Object.keys(userConfiguration).filter(key => {
        if (isTerminalConfiguration) return !defaultTerminalConfigurationKeys.includes(key);
        return !defaultFileConfigurationKeys.includes(key);
    });
    if (incorrectProperties.length > 0)
        throw new Error(`Unknown properties found, remove them: ${incorrectProperties}`);

    // Check properties shared by both are correct.
    if (userConfiguration.level && typeof userConfiguration.level !== 'string')
        throw new Error('Configuration value "level" must be of type "string".');
    if (userConfiguration.callee && typeof userConfiguration.callee !== 'boolean')
        throw new Error('Configuration value "callee" must be of type "boolean".');
    if (userConfiguration.json && typeof userConfiguration.json !== 'boolean')
        throw new Error('Configuration value "json" must be of type "boolean".');

    // If chalk is defined make sure it's of correct type.
    const chalkIsNotUndefinedButIsIncorrect =
        userConfiguration.chalk !== undefined &&
        (userConfiguration.chalk.constructor !== undefined &&
            userConfiguration.chalk.constructor.name !== 'Chalk');
    if (chalkIsNotUndefinedButIsIncorrect) {
        throw new Error('Configuration value for property "chalk" must be of instance "Chalk".');
    }
}

////////////////////////////////////////////////////////////////////////////////

export default function create(userConfigurationOrConfigurations) {
    devLog('Recieved user configuration or configurations:', userConfigurationOrConfigurations);

    ////////////////////////////////////////////////////////////////////////////////

    // Validate configuration.
    devLog('Validating user configuration.');

    // Check if it is undefined, an array or a single object.
    const isUndefined = userConfigurationOrConfigurations === undefined;
    const isArray = !isUndefined && Array.isArray(userConfigurationOrConfigurations);
    const isObjectAndNotNull =
        typeof userConfigurationOrConfigurations === 'object' &&
        userConfigurationOrConfigurations !== null;
    const isNotUndefinedOrArrayOrObject = !isUndefined && !isArray && !isObjectAndNotNull;
    if (isNotUndefinedOrArrayOrObject) {
        // Invalid configuration type.
        throw new Error('Configuration must be of type "object" or an "array" of "objects".');
    }

    // Convery single object into array.
    const userConfigurations = isUndefined
        ? [defaultTerminalConfiguration] // Default.
        : isObjectAndNotNull
        ? [userConfigurationOrConfigurations]
        : userConfigurationOrConfigurations;

    // All of the configurations check out. Check if there is more than one terminal configuration.
    let numberOfTerminalConfigurations = 0;
    const configurations = userConfigurations.map(function validateAndcompleteUserConfiguration(
        configuration
    ) {
        // Validate.
        validateConfiguration(configuration);

        const isTerminalConfiguration = configuration.type === 'terminal';
        if (isTerminalConfiguration) {
            numberOfTerminalConfigurations += 1;

            const tooManyTerminalConfigurations = numberOfTerminalConfigurations > 1;
            if (tooManyTerminalConfigurations)
                throw new Error(
                    `Only one configuration terminal may be included. Number of configurations found: ${numberOfTerminalConfigurations}`
                );

            // Complete.
            return { ...defaultTerminalConfiguration, ...configuration };
        } else {
            // Complete.
            return { ...defaultFileConfiguration, ...configuration };
        }
    });

    devLog(
        'User configuration has been validated. Configurations:',
        JSON.stringify(configurations)
    );

    ////////////////////////////////////////////////////////////////////////////////

    devLog('Creating transports.');
    const transports = [];
    configurations.map(configuration => {
        if (configuration.type === 'terminal') {
            // Create and add transport.
            transports.push(createTerminalTransport(configuration));
        } else if (configuration.type === 'file') {
            // Create and add transport.
            transports.push(createFileTransport(configuration));
        }
    });
    devLog(`Transports created. Amount of transports: ${transports.length}`);

    ////////////////////////////////////////////////////////////////////////////////

    devLog('Creating log instance.');
    const log = {
        error: (...messages) => {
            error(transports, messages);
        },
        warn: (...messages) => {
            warn(transports, messages);
        },
        info: (...messages) => {
            info(transports, messages);
        },
        debug: (...messages) => {
            debug(transports, messages);
        },
        trace: (...messages) => {
            trace(transports, messages);
        },
        _configurations: configurations
    };
    devLog('Log instance created.');

    ////////////////////////////////////////////////////////////////////////////////

    return log;
}

////////////////////////////////////////////////////////////////////////////////

function error(transports, messages) {
    devLog('error messages:', messages);
    const date = new Date();
    transports.forEach(func => func(date, 'ERROR', messages));
}
function warn(transports, messages) {
    devLog('warn messages:', messages);
    const date = new Date();
    transports.forEach(func => func(date, 'WARN', messages));
}
function info(transports, messages) {
    devLog('info messages:', messages);
    const date = new Date();
    transports.forEach(func => func(date, 'INFO', messages));
}
function debug(transports, messages) {
    devLog('debug messages:', messages);
    const date = new Date();
    transports.forEach(func => func(date, 'DEBUG', messages));
}
function trace(transports, messages) {
    devLog('trace messages:', messages);
    const date = new Date();
    transports.forEach(func => func(date, 'TRACE', messages));
}

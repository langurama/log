// Node modules
const fs = require('fs');
const path = require('path');
// NPM modules
const chalk = require('chalk');
const validate = require('../validate/validate.js');

let isVerbose = false;

function LogError(message) {
    Error.call(this, message);
    Error.captureStackTrace(this, arguments.callee);
    this.name = 'LogError';
    this.message = message;
}
LogError.prototype.__proto__ = Error.prototype;

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

function formatMessages(...messages) {
    const message = messages.reduce((message, argument) => {
        let newMessage;

        if (message === '') {
            newMessage = message;
        } else {
            newMessage = `${message} `;
        }

        if (argument === undefined) {
            newMessage += undefined;
        } else if (argument === null) {
            newMessage += argument;
        } else if (argument.constructor === Array) {
            newMessage += argument.toString();
        } else if (argument.constructor === String) {
            newMessage += argument;
        } else if (argument.constructor === Number) {
            newMessage += argument.toString();
        } else if (argument.constructor === Boolean) {
            newMessage += argument.toString();
        } else if (argument.constructor === Error) {
            newMessage += argument.stack;
        } else if (argument.constructor === Object) {
            newMessage += JSON.stringify(argument, null, 4);
        } else {
            newMessage += argument.toString();
        }

        return newMessage;
    }, '');

    return message;
}

function getCallee() {
    // prettier-ignore
    return new Error().stack.split('\n')[6].split('(')[1].split(')')[0];
}

function createTerminalTransport(option) {
    const shouldIncludeCallee = option.callee === false ? false : true;

    return function terminalTransport(date, level, messages) {
        const timestamp = getTimestamp(date);

        let string;
        if (shouldIncludeCallee) {
            // prettier-ignore
            string = `${formatMessages(messages)} ${getCallee()}`;
        } else {
            string = formatMessages(messages);
        }

        let log;
        if (level === 'ERROR') {
            log = `${chalk.grey(timestamp)}  ${chalk.bgBlack(
                chalk.bgRed.white(chalk.bold(level))
            )} ${string}\n`;
            process.stderr.write(log);
            return;
        } else if (level === 'WARN') {
            log = `${chalk.grey(timestamp)}   ${chalk.bgYellow(
                chalk.black(chalk.bold(level))
            )} ${string}\n`;
            process.stderr.write(log);
            return;
        } else if (level === 'INFO') {
            log = `${chalk.grey(timestamp)}   ${chalk.white(
                chalk.bold(level)
            )} ${string}\n`;
        } else if (level === 'DEBUG') {
            log = `${chalk.grey(timestamp)}  ${chalk.cyan(level)} ${string}\n`;
        } else if (level === 'TRACE') {
            log = `${chalk.grey(timestamp)}  ${chalk.green(level)} ${string}\n`;
        } else {
            return;
        }
        process.stdout.write(log);
    };
}

function createFileTransport(option) {
    const shouldIncludeCallee = option.callee === false ? false : true;
    const shouldJsonFormat = option.json === true ? true : false;
    // prettier-ignore
    const isAnAbsolutePath =
        option.path.startsWith('/') // Linux/macOS
        || option.path.substring(1).startsWith(':/'); // Windows
    // prettier-ignore
    const logPathTmp = option.path.split('/');
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

function Log(configurationOrPath, logConfiguration) {
    this.isVerbose =
        logConfiguration &&
        logConfiguration.verbose &&
        logConfiguration.verbose === true;

    const log = {
        debug: function(...messages) {
            if (isVerbose === true) {
                process.stdout.write(
                    chalk.yellow(
                        '[@basickarl/log] ' + messages.toString() + '\n'
                    )
                );
            }
        },
        error: function(...messages) {
            throw new LogError(
                chalk.yellow('[@basickarl/log] ') + messages.toString()
            );
        },
        info: function(...messages) {
            process.stdout.write(
                chalk.yellow('[@basickarl/log] ' + messages.toString() + '\n')
            );
        }
    };

    this.transports = [];
    this.configuration = getJson(configurationOrPath);

    const schema = {
        doc: 'Configuration argument type',
        default: null,
        format: 'Array',
        values: [
            {
                callee: 'common.callee',
                level: 'common.level',
                type: {
                    doc: 'Transport type',
                    format: 'String',
                    values: ['url'],
                    default: null
                },
                url: {
                    doc: '-',
                    format: 'String',
                    default: null
                }
            },
            {
                callee: 'common.callee',
                level: 'common.level',
                type: {
                    doc: 'Transport type.',
                    format: 'String',
                    values: ['terminal'],
                    default: null
                }
            },
            {
                callee: 'common.callee',
                json: {
                    doc: 'Save the message in JSON format',
                    format: 'Boolean',
                    default: false
                },
                level: 'common.level',
                path: {
                    doc: 'Path to where the log will be saved to',
                    format: 'String',
                    default: null
                },
                type: {
                    doc: 'Transport type',
                    format: 'String',
                    values: ['file'],
                    default: null
                }
            }
        ],
        common: {
            level: {
                doc: 'Log level of transport',
                format: 'String',
                values: ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'],
                default: 'INFO'
            },
            callee: {
                doc:
                    'The file and line where the log was called to be included in the log message',
                format: 'Boolean',
                default: false
            }
        }
    };

    // validate('schema_array.json', transportConfigurations);
    validate(schema, this.configuration);
    // validate('schema_object.json', transportConfigurations, { verbose: true });
    // validate(schema, transportConfigurations);
    // validate('schema.json', './config.json');
    // validate(schema, '/home/karl/dev/retard-log/src/config.json');

    this.configuration.map(transportConfiguration => {
        if (transportConfiguration.type === 'terminal') {
            // Create and add transport
            this.transports.push(
                createTerminalTransport(transportConfiguration)
            );
        } else if (transportConfiguration.type === 'file') {
            // Create and add transport
            this.transports.push(createFileTransport(transportConfiguration));
        }
    });

    function parseJson(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            if (error.message.includes('no such file or directory')) {
                // File not found
                const filePath = error.message.split("'")[1];
                log.error(`No such file: ${filePath}`);
            } else if (
                error.message.includes('JSON') &&
                error.message.includes('position')
            ) {
                // Incorrect JSON
                const unexpectedToken = error.message.split(' ')[2];
                // Display where the error is in the JSON file
                const rows = jsonString.split('\n');
                const lineNumber = error.message.split('position ')[1];
                let total = 0;
                let isFirst = true;
                for (let i = 0; i < rows.length; i += 1) {
                    if (!isFirst) {
                        total += 1;
                    } else {
                        isFirst = false;
                    }

                    if (total + rows[i].length <= lineNumber) {
                        // Not this line, next
                        total += rows[i].length;
                    } else {
                        // This line
                        const arrow =
                            new Array(lineNumber - total + 1).join(' ') +
                            '^   line: ' +
                            (i + 1) +
                            ' char: ' +
                            (lineNumber - total + 1) +
                            ' unexpected token: ' +
                            unexpectedToken;
                        log.error(`Wrongly formatted JSON file
    ${rows[i]}
    ${arrow}`);
                        break;
                    }
                }
            }
            throw error;
        }
    }

    function getJson(jsonOrPath) {
        if (jsonOrPath.constructor.name === 'String') {
            let absolutePath;
            if (jsonOrPath.charAt(0) === '/' || jsonOrPath.charAt(1) === ':') {
                // Linux or Windows absolute string
                absolutePath = jsonOrPath;
            } else {
                // Linux/Windows Realtive path
                absolutePath = path.join(__dirname, jsonOrPath);
            }
            // Path
            let jsonString;
            try {
                jsonString = fs.readFileSync(absolutePath, 'utf8');
                return parseJson(jsonString);
            } catch (error) {
                if (error.message.includes('no such file or directory')) {
                    // File not found
                    const filePath = error.message.split("'")[1];
                    log.error(`No such file: ${filePath}`);
                }
                throw error;
            }
        } else {
            // Object
            return jsonOrPath;
        }
    }
}
Log.prototype.error = function(...messages) {
    const date = new Date();
    this.transports.forEach(func => func(date, 'ERROR', messages));
};
Log.prototype.warn = function(...messages) {
    const date = new Date();
    this.transports.forEach(func => func(date, ' WARN', messages));
};
Log.prototype.info = function(...messages) {
    const date = new Date();
    this.transports.forEach(func => func(date, ' INFO', messages));
};
Log.prototype.debug = function(...messages) {
    const date = new Date();
    this.transports.forEach(func => func(date, 'DEBUG', messages));
};
Log.prototype.trace = function(...messages) {
    const date = new Date();
    this.transports.forEach(func => func(date, 'TRACE', messages));
};

module.exports = Log;

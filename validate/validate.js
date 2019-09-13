// Node modules
const fs = require('fs');
const path = require('path');
// NPM modules
const chalk = require('chalk');

function ValidateError(message) {
    Error.call(this, message);
    Error.captureStackTrace(this, arguments.callee);
    this.name = 'ValidateError';
    this.message = message;
}
ValidateError.prototype.__proto__ = Error.prototype;

let isVerbose = false;

const log = {
    debug: function(...messages) {
        if (isVerbose === true) {
            chalk.yellow('[@basickarl/validate] ' + messages.toString() + '\n');
        }
    },
    error: function(...messages) {
        throw new ValidateError(
            chalk.yellow('[@basickarl/log] ') + messages.toString()
        );
    },
    info: function(...messages) {
        process.stdout.write(messages.toString() + '\n');
    }
};

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

module.exports = function(
    schemaOrPath,
    configurationOrPath,
    validationConfiguration
) {
    const schema = getJson(schemaOrPath);
    const configuration = getJson(configurationOrPath);
    isVerbose =
        validationConfiguration &&
        validationConfiguration.verbose &&
        validationConfiguration.verbose === true;

    function schemaValidate(o, _name, _common, isValueInValues) {
        const stype = o.constructor.name;

        let common;
        if (_common) {
            common = _common;
        } else {
            common = o.common;
        }

        let name = stype;
        if (_name) {
            name = _name;
            log.debug('name: "' + name + '" type: ', stype);
        } else if (o.common) {
            // First time, check commons
            log.debug('name: "' + name + '" type: ', stype);
            schemaValidate(o.common, name + '.common', common, false);
        }

        if (stype === 'Array') {
            log.debug('  Array hit');
        } else if (stype === 'Object') {
            log.debug('  Object hit');
            // Check if it is an end object
            const isConfigurationValue = o.doc && o.format;
            if (isConfigurationValue) {
                // Configuration properties
                log.debug('    configuration object');
                if (o.format === 'Array') {
                    // Format is: Array
                    log.debug('      format: Array');
                    // Check: values
                    const hasValues = o.values;
                    if (hasValues !== undefined) {
                        // Check to see if values type is correct
                        const isIncorrectCorrectValuesType =
                            o.values.constructor.name !== 'Array';
                        if (isIncorrectCorrectValuesType) {
                            log.error(
                                'Incorrect type set on values property, expected type Array, got type: ' +
                                    o.values.constructor.name
                            );
                        }
                        // check to see that it is not empty
                        const isValuesEmpty = o.values.length === 0;
                        if (isValuesEmpty) {
                            log.error(
                                'Incorrect value set for values property, expected a non empty Array, got an empty array(' +
                                    name +
                                    '.values)'
                            );
                        }
                        // Check to see that every element in the array is not an incorrect format
                        o.values.forEach((selement, index) => {
                            schemaValidate(
                                selement,
                                name + '.values[' + index + ']',
                                common,
                                true
                            );
                        });
                        log.debug('    values: ' + o.values);
                    }
                    // Check: default
                    const hasDefault = o.default;
                    if (hasDefault !== undefined) {
                        const defaultIsNull = o.default === null;
                        const defaultIsArray =
                            o.default !== null &&
                            o.default.constructor.name === 'Array';
                        if (!defaultIsNull && !defaultIsArray) {
                            // Incorrect type, is not array
                            log.error(
                                'Incorrect type set on default property, expected type Array or null, got type: ' +
                                    o.default.constructor.name
                            );
                        } else if (defaultIsArray) {
                            if (hasValues) {
                                // format Array and values is actually an array
                                // check to see that it is not empty
                                const isDefaultEmpty = o.default.length === 0;
                                if (isDefaultEmpty) {
                                    log.error(
                                        'Incorrect value set for default property, expected a non empty Array, got an empty array(' +
                                            name +
                                            '.default)'
                                    );
                                } else {
                                    // Not exmpty, check so that it is the same format as given in values
                                    o.default.forEach((delement, dindex) => {
                                        const end = o.values.reduce(
                                            (va, velement) => {
                                                const isTheSame =
                                                    Object.entries(
                                                        delement
                                                    ).toString() ===
                                                    Object.entries(
                                                        velement
                                                    ).toString();
                                                if (isTheSame) {
                                                    return true;
                                                }
                                                return va;
                                            },
                                            false
                                        );
                                        if (!end) {
                                            log.error(
                                                'the following value in the default array (' +
                                                    name +
                                                    '.default[' +
                                                    dindex +
                                                    ']' +
                                                    '): ' +
                                                    JSON.stringify(delement) +
                                                    ' did not exist in the values array (' +
                                                    name +
                                                    '.values)'
                                            );
                                        }
                                    });
                                }
                            }
                        }
                        log.debug(
                            '      default: ' + JSON.stringify(o.default)
                        );
                    }
                } else if (o.format === 'String') {
                    // Format is: String
                    log.debug('      format: String');
                    // Check: values
                    const hasValues = o.values;
                    if (hasValues !== undefined) {
                        // Check to see if values type is correct
                        const isIncorrectCorrectValuesType =
                            o.values.constructor.name !== 'Array' &&
                            o.values.constructor.name !== 'String';
                        if (isIncorrectCorrectValuesType) {
                            log.error(
                                'Incorrect type set on values property, expected type Array or String, got type: ' +
                                    o.values.constructor.name
                            );
                        }
                        // Check to see that every element in the array is not an incorrect format
                        o.values.forEach(velement => {
                            const isIncorrectCorrectValueType =
                                velement.constructor.name !== 'String';
                            if (isIncorrectCorrectValueType) {
                                log.error(
                                    'Incorrect value type set in values array(' +
                                        name +
                                        '.values), expected type String, got type: ' +
                                        velement.constructor.name
                                );
                            }
                        });

                        log.debug('      values:', JSON.stringify(o.values));
                    }
                    // Check: default
                    const hasDefault = o.default;
                    if (hasDefault !== undefined) {
                        const defaultIsNull = o.default === null;
                        const defaultIsString =
                            o.default !== null &&
                            o.default.constructor.name === 'String';

                        if (!defaultIsNull && !defaultIsString) {
                            // Incorrect type, is not string
                            log.error(
                                'Incorrect type set on default property, expected type String or null, got type: ' +
                                    o.default.constructor.name
                            );
                        } else if (defaultIsString) {
                            if (hasValues) {
                                // check so that it is the same format as given in values
                                const doesNotContainValue = !o.values.includes(
                                    o.default
                                );
                                if (doesNotContainValue) {
                                    log.error(
                                        'the following value in the default property (' +
                                            name +
                                            '.default): ' +
                                            o.default +
                                            ' did not exist in the values array (' +
                                            name +
                                            '.values)'
                                    );
                                }
                            }
                        }
                        log.debug(
                            '      default: ' + JSON.stringify(o.default)
                        );
                    }
                } else if (o.format === 'Boolean') {
                    // Format is: Boolean
                    log.debug('      format: Boolean');
                    // Check: values
                    const hasValues = o.values;
                    if (hasValues !== undefined) {
                        log.error(
                            'Boolean format cannot have values property(' +
                                name +
                                '.values) as it can only have two values true or false, there is no point dummy'
                        );
                    }
                    // Check: default
                    const hasDefault = o.default;
                    if (hasDefault !== undefined) {
                        const defaultIsNull = o.default === null;
                        const defaultIsBoolean =
                            o.default !== null &&
                            o.default.constructor.name === 'Boolean';

                        if (!defaultIsNull && !defaultIsBoolean) {
                            // Incorrect type, is not boolean
                            log.error(
                                'Incorrect type set on default property(' +
                                    name +
                                    '.default), expected type Boolean, got type: ' +
                                    o.default.constructor.name
                            );
                        }
                        log.debug('      default:', JSON.stringify(o.default));
                    }
                } else if (o.format === 'Object') {
                    // Format is: Object
                    log.debug('      format: Object');
                    // Check: values
                    const hasValues = o.values;
                    if (hasValues !== undefined) {
                        // Check to see if values type is correct
                        const isIncorrectCorrectValuesType =
                            o.values.constructor.name !== 'Object';
                        if (isIncorrectCorrectValuesType) {
                            log.error(
                                'Incorrect type set on values property, expected type Object, got type: ' +
                                    o.values.constructor.name
                            );
                        }
                        // check to see that it is not empty
                        const isValuesEmpty = o.values.length === 0;
                        if (isValuesEmpty) {
                            log.error(
                                'Incorrect value set for values property, expected a non empty Object, got an empty Object(' +
                                    name +
                                    '.values)'
                            );
                        }
                        // Check to see that every object in the object is not an incorrect format
                        Object.keys(o.values).forEach(key => {
                            schemaValidate(
                                o.values[key],
                                name + '.values.' + key,
                                common,
                                true
                            );
                        });

                        log.debug('    values:', o.values);
                    }
                } else {
                    log.error(
                        'unknown format type at ' +
                            name +
                            '.format: ' +
                            o.format
                    );
                }
            } else {
                // Not a configuration object
                log.debug('    level object');
                Object.keys(o).forEach(key => {
                    log.debug('     ', key + ': ' + JSON.stringify(o[key]));
                    schemaValidate(o[key], name + '.' + key, common, false);
                });
            }
        } else if (stype === 'String') {
            // May only call common objects here
            log.debug('  String hit');
            if (!isValueInValues) {
                let tmpObject = common;
                const commonArray = o.split('.');
                commonArray.shift();
                commonArray.forEach(key => {
                    tmpObject = tmpObject[key];
                });
                if (tmpObject === undefined) {
                    log.error(
                        'Unknown object call at: ' +
                            name +
                            ' cannot find the common object: ' +
                            o
                    );
                }
            }
        } else if (stype === 'Boolean') {
            log.debug('  Boolean hit');
        } else {
            log.error(
                'Incorrect configuration type, expected type Array, String or Object(' +
                    name +
                    '), got type: ' +
                    stype
            );
        }
    }
    schemaValidate(schema);
};

/**
 * @jest-environment node
 */

// Native modules.
import { default as assert } from 'assert';
import { default as fs } from 'fs';
import { default as path } from 'path';

// NPM modules.
import { default as chai } from 'chai';
import { default as spies } from 'chai-spies';
import { default as readline } from 'readline';
import { v4 as uuidv4 } from 'uuid';
import { default as chalk } from 'chalk';

// Local modules.
import {
    default as languramaLog,
    defaultTerminalConfiguration,
    defaultFileConfiguration,
    info
} from '../src';
// eslint-disable-next-line no-unused-vars
import { testLog } from './helper';

chai.use(spies);

const testLogDir = path.join('.', 'test', '.tmp');

const timestampRegEx = new RegExp(
    '^[0-9]{4}-((0[1-9]{1})|(1[0-2]{1}))-((0[1-9]{1})|([1-2]{1}[0-9]{1})|3[0-1]{1}) (([0-1]{1}[0-9]{1})|(2[0-3]{1})):[0-5]{1}[0-9]{1}:[0-5]{1}[0-9]{1} UTC[+|-]([0-9]{1}|10|11|12)$'
);

function getUniqueName() {
    return `${new Date().getTime()}-${uuidv4()}`;
}

function getUniqueRelativeDirPath() {
    return path.join(testLogDir, getUniqueName());
}

function getUniqueAbsoluteDirPath() {
    return path.join(process.cwd(), testLogDir, getUniqueName());
}

function getUniqueRelativeFilePath() {
    return path.join(getUniqueRelativeDirPath(), 'test.log');
}

function getUniqueAbsoluteFilePath() {
    return path.join(getUniqueAbsoluteDirPath(), 'test.log');
}

function getTimestamp(line) {
    return line.slice(0, 25).trim();
}

function getFileContents(filePath) {
    return fs.readFileSync(filePath, { encoding: 'utf-8' });
}

function getFirstLineFromFile(filePath) {
    return getFileContents(filePath).split('\n')[0];
}

function getMessageFromLog(line) {
    const messageArray = line.split('INFO ');
    messageArray.shift();
    const message = messageArray.join('INFO ');
    return message;
}

function createFileLog(filePath) {
    return languramaLog({
        ...defaultFileConfiguration,
        callee: false,
        path: filePath
    });
}

describe('Node', () => {
    describe('Configuration', () => {
        it('should create a log object with default configuration', () => {
            // Setup.
            const expectedResultArray = [defaultTerminalConfiguration];
            const expectedResultType = typeof expectedResultArray;
            // Test.
            const log = languramaLog();
            // Assert.
            const actualResultArray = log._configurations;
            const actualResultType = typeof actualResultArray;
            assert.strictEqual(actualResultType, expectedResultType);
            assert.deepEqual(actualResultArray, expectedResultArray);
        });
        it('should create a log object from a terminal configuration object', () => {
            // Setup.
            const configuration = defaultTerminalConfiguration;
            const expectedResultArray = [configuration];
            const expectedResultType = typeof expectedResultArray;
            // Test.
            const log = languramaLog(configuration);
            // Assert.
            const actualResultArray = log._configurations;
            const actualResultType = typeof actualResultArray;
            assert.strictEqual(actualResultType, expectedResultType);
            assert.deepEqual(actualResultArray, expectedResultArray);
        });
        it('should create a log object from a file configuration object', () => {
            // Setup.
            const configuration = {
                ...defaultFileConfiguration,
                path: getUniqueRelativeFilePath()
            };
            const expectedResultArray = [configuration];
            const expectedResultType = typeof expectedResultArray;
            // Test.
            const log = languramaLog(configuration);
            // Assert.
            const actualResultArray = log._configurations;
            const actualResultType = typeof actualResultArray;
            assert.strictEqual(actualResultType, expectedResultType);
            assert.deepEqual(actualResultArray, expectedResultArray);
        });
        it('should create a log file directory from a file configuration object with a relative path', () => {
            // Setup.
            const dirPath = getUniqueRelativeDirPath();
            // Test.
            languramaLog({ ...defaultFileConfiguration, path: path.join(dirPath, 'test.log') });
            // Assert.
            assert(fs.existsSync(dirPath), 'Log file directory was not created.');
        });
        it('should create a log file directory from a file configuration object with an absolute path', () => {
            // Setup.
            const dirPath = getUniqueAbsoluteDirPath();
            // Test.
            languramaLog({ ...defaultFileConfiguration, path: path.join(dirPath, 'test.log') });
            // Assert.
            assert(fs.existsSync(dirPath), 'Log file directory was not created.');
        });
        it('should not crash if log directory already exists', () => {
            // Setup.
            const dirPath = getUniqueRelativeDirPath();
            if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
            // Test.
            try {
                languramaLog({
                    type: 'file',
                    path: path.join(dirPath, 'test.log')
                });
            } catch (error) {
                // Assert.
                assert.fail(error);
            }
        });
        it('should throw an error if an invalid type configuration is given', () => {
            // Setup.
            const expectedResult = new RegExp(
                'Configuration must be of type "object" or an "array" of "objects".'
            );
            // Test.
            const test = () => languramaLog(true);
            // Assert.
            assert.throws(test, expectedResult);
        });
        it('should throw an error if correct type but incorrect configuration is given', () => {
            // Setup.
            const expectedResult = new RegExp(
                'Invalid configuration value for the property "type": undefined'
            );
            // Test.
            const test = () => languramaLog({});
            // Assert.
            assert.throws(test, expectedResult);
        });
        it('should throw an error if an invalid type configuration is given', () => {
            // Setup.
            const expectedResult = new RegExp(
                'Error: Configuration must be of type "object" or an "array" of "objects".'
            );
            // Test.
            const test = () => languramaLog(null);
            // Assert.
            assert.throws(test, expectedResult);
        });
        it('should throw an error if more than one terminal configuration is given', () => {
            // Setup.
            const expectedResult = new RegExp(
                'Error: Only one configuration terminal may be included. Number of configurations found: 2'
            );
            // Test.
            const test = () =>
                languramaLog([defaultTerminalConfiguration, defaultTerminalConfiguration]);
            // Assert.
            assert.throws(test, expectedResult);
        });
        it('should throw an error if a valid type configuration array but incorrect element type "null" is given', () => {
            // Setup.
            const expectedResult = new RegExp(
                'Error: "terminal" or "file" configuration must be of type "object". Received: null'
            );
            // Test.
            const test = () => languramaLog([null, { type: 'terminal' }]);
            // Assert.
            assert.throws(test, expectedResult);
        });
        it('should throw an error if a valid type configuration array but incorrect element type is given', () => {
            // Setup.
            const expectedResult = new RegExp(
                'Error: "terminal" or "file" configuration must be of type "object". Received: 1'
            );
            // Test.
            const test = () => languramaLog([1, { type: 'terminal' }]);
            // Assert.
            assert.throws(test, expectedResult);
        });
        it('should throw an error if a valid type configuration array and valid element types but invalid configurations is given', () => {
            // Setup.
            const expectedResult = new RegExp(
                'Error: Invalid configuration value for the property "type": undefined'
            );
            // Test.
            const test = () => languramaLog([{}, {}]);
            // Assert.
            assert.throws(test, expectedResult);
        });
        it('should throw an error if an unknown type in the configuration is given', () => {
            // Setup.
            const expectedResult = new RegExp(
                'Error: Unknown properties found, remove them: unknown'
            );
            // Test.
            const test = () =>
                languramaLog({
                    ...defaultTerminalConfiguration,
                    unknown: 'herro'
                });
            // Assert.
            assert.throws(test, expectedResult);
        });
        it('should throw an error if correct type but incorrect configuration property "type" is given', () => {
            // Setup.
            const expectedResult = new RegExp(
                'Invalid configuration value for the property "type": does not exist'
            );
            // Test.
            const test = () => languramaLog({ type: 'does not exist' });
            // Assert.
            assert.throws(test, expectedResult);
        });
        it('should throw an error if correct type but incorrect configuration property "chalk" is given', () => {
            // Setup.
            const expectedResult = new RegExp(
                'Error: Configuration value for property "chalk" must be of instance "Chalk".'
            );
            // Test.
            const test = () => languramaLog({ ...defaultTerminalConfiguration, chalk: true });
            // Assert.
            assert.throws(test, expectedResult);
        });
        it('should throw an error if correct type but incorrect configuration property value "level" is given', () => {
            // Setup.
            const expectedResult = new RegExp(
                'Invalid configuration value for the property "level" must be one of the following: error,warn,info,debug,trace'
            );
            // Test.
            const test = () => languramaLog({ type: 'terminal', level: 'does not exist' });
            // Assert.
            assert.throws(test, expectedResult);
        });
        it('should throw an error if an invalid type for configuration property "level" is given', () => {
            // Setup.
            const expectedResult = new RegExp(
                'Error: Invalid configuration value for the property "level" must be of type "string".'
            );
            // Test.
            const test = () => languramaLog({ type: 'terminal', level: true });
            // Assert.
            assert.throws(test, expectedResult);
        });
        it('should throw an error if an invalid type for configuration property "json" is given', () => {
            // Setup.
            const expectedResult = new RegExp(
                'Error: Invalid configuration value for the property "json" must be of type "boolean".'
            );
            // Test.
            const test = () => languramaLog({ ...defaultFileConfiguration, json: 'true' });
            // Assert.
            assert.throws(test, expectedResult);
        });
        it('should throw an error if correct type but incorrect configuration property "callee" is given', () => {
            // Setup.
            const expectedResult = new RegExp(
                'Invalid configuration value for the property "callee" must be of type "boolean".'
            );
            // Test.
            const test = () =>
                languramaLog({ type: 'terminal', level: 'info', callee: 'does not exist' });
            // Assert.
            assert.throws(test, expectedResult);
        });
    });
    describe('Functionality', () => {
        it('should write all stdout log levels to stdout when using terminal transport', () => {
            // Setup.
            const uuid = uuidv4();
            const messages = [`${uuid}_info`, `${uuid}_debug`, `${uuid}_trace`];
            const log = languramaLog({ ...defaultTerminalConfiguration, level: 'trace' });
            const mock = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});
            // Test.
            log.info(messages[0]);
            log.debug(messages[1]);
            log.trace(messages[2]);
            // Assert.
            expect(mock).toHaveBeenCalledTimes(3);
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[0]));
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[1]));
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[2]));
        });
        it('should write all stderr log levels to stderr when using terminal transport', () => {
            // Setup.
            const uuid = uuidv4();
            const messages = [`${uuid}_error`, `${uuid}_warn`];
            const log = languramaLog();
            const mock = jest.spyOn(process.stderr, 'write').mockImplementation(() => {});
            // Test.
            log.error(messages[0]);
            log.warn(messages[1]);
            // Assert.
            expect(mock).toHaveBeenCalledTimes(2);
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[0]));
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[1]));
        });
        it('should display stdout logs in color when using chalk', () => {
            // Setup.
            const uuid = uuidv4();
            const messages = [
                [`${uuid}_chalk_info`, /\[37mINFO\[39m/],
                [`${uuid}_chalk_debug`, /\[36mDEBUG\[39m/],
                [`${uuid}_chalk_trace`, /\[32mTRACE\[39m/]
            ];

            const log = languramaLog({ ...defaultTerminalConfiguration, level: 'trace', chalk });
            const mock = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});
            // Test.
            log.info(messages[0][0]);
            log.debug(messages[1][0]);
            log.trace(messages[2][0]);
            // Assert.
            expect(mock).toHaveBeenCalledTimes(3);
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[0][1]));
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[1][1]));
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[2][1]));
        });
        it('should handle multiple messages given', () => {
            // Setup.
            const messages = [['first', 'second'], /first second/];
            const log = languramaLog();
            const mock = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});
            // Test.
            log.info(...messages[0]);
            // Assert.
            expect(mock).toHaveBeenCalledTimes(1);
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[1]));
        });
        it('should display stderr logs in color when using chalk', () => {
            // Setup.
            const uuid = uuidv4();
            const messages = [
                [`${uuid}_chalk_error`, /\[40m\[41m\[37m\[1mERROR\[22m\[39m\[40m\[49m/],
                [`${uuid}_chalk_warn`, /\[43m\[43m\[30m\[1mWARN\[22m\[39m\[43m\[49m/]
            ];

            const log = languramaLog({ ...defaultTerminalConfiguration, chalk });
            const mock = jest.spyOn(process.stderr, 'write').mockImplementation(() => {});
            // Test.
            log.error(messages[0][0]);
            log.warn(messages[1][0]);
            // Assert.
            expect(mock).toHaveBeenCalledTimes(2);
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[0][1]));
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[1][1]));
        });
        it('should display all types in color when using chalk', () => {
            // This one won't work on Windows: https://github.com/chalk/chalk/issues/411
            // Setup.
            const messages = [
                ['string', / string /],
                [true, /\[33mtrue\[39m/],
                [1, /\[32m1\[39m/],
                [[1, 2], /\[32m[1,2]\[39m/],
                [undefined, /\[34mundefined\[39m/],
                [null, /\[34mnull\[39m/],
                [{ herro: 'herro' }, /"herro": "herro"\n/],
                [Symbol(666), / Symbol\(666\) /],
                [new Error('help'), /\[31mError: help\[39m/]
            ];
            const log = languramaLog({ ...defaultTerminalConfiguration, level: 'trace', chalk });
            const mock = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});
            // Test.
            // log.info(messages[0][0]);
            // log.info(messages[1][0]);
            log.info(messages[2][0]);
            log.info(messages[3][0]);
            log.info(messages[4][0]);
            log.info(messages[5][0]);
            log.info(messages[6][0]);
            log.info(messages[7][0]);
            log.info(messages[8][0]);
            // Assert.
            // expect(mock).toHaveBeenCalledTimes(9);
            // expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[0][1]));
            // expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[1][1]));
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[2][1]));
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[3][1]));
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[4][1]));
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[5][1]));
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[6][1]));
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[7][1]));
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(messages[8][1]));
        });
        it('should not display callee in stdout', () => {
            // Setup.
            const log = languramaLog({
                ...defaultTerminalConfiguration,
                level: 'trace',
                callee: false
            });
            const mock = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});
            // Test.
            log.info(null);
            log.debug(null);
            log.trace(null);
            // Assert.
            expect(mock).toHaveBeenCalledTimes(3);
            expect(mock).not.toHaveBeenCalledWith(
                jasmine.stringMatching(/log\/test\/index.node.spec.js/)
            );
        });
        it('should not display callee in stderr', () => {
            // Setup.
            const log = languramaLog({
                ...defaultTerminalConfiguration,
                callee: false
            });
            const mock = jest.spyOn(process.stderr, 'write').mockImplementation(() => {});
            // Test.
            log.error(null);
            log.warn(null);
            // Assert.
            expect(mock).toHaveBeenCalledTimes(2);
            expect(mock).not.toHaveBeenCalledWith(
                jasmine.stringMatching(/log\/test\/index.node.spec.js/)
            );
        });
        it('should display correct color in stack trace', () => {
            // Setup.
            const log = languramaLog();
            const mock = jest.spyOn(process.stderr, 'write').mockImplementation(() => {});
            const error = new Error('shite');
            error.stack = `${
                error.stack.split('\n')[0]
            }\n    at processTicksAndRejections (internal/process/task_queues.js:94:5)`;
            // Test.
            log.error(error);
            // Assert.
            expect(mock).toHaveBeenCalledTimes(1);
            expect(mock).toHaveBeenCalledWith(jasmine.stringMatching(/\(internal\//));
        });
        it('should not display low level log in terminal when log level is set too high', () => {
            // Setup.
            const log = languramaLog();
            const mock = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});
            // Test.
            log.trace('');
            // Assert.
            expect(mock).toHaveBeenCalledTimes(0);
        });
        it('should write all log levels to a file when using file transport with absolute path', done => {
            // Setup.
            const uuid = uuidv4();
            const logMessages = [
                `${uuid}_error`,
                `${uuid}_warn`,
                `${uuid}_info`,
                `${uuid}_debug`,
                `${uuid}_trace`,
                `${uuid}_low_trace`
            ];
            const filePath = getUniqueAbsoluteFilePath();
            const log = languramaLog({
                ...defaultFileConfiguration,
                path: filePath,
                level: 'trace'
            });
            const logTooLowLogLevel = languramaLog({
                ...defaultFileConfiguration,
                path: filePath,
                level: 'debug'
            });
            // Test.
            log.error(logMessages[0]);
            log.warn(logMessages[1]);
            log.info(logMessages[2]);
            log.debug(logMessages[3]);
            log.trace(logMessages[4]);
            logTooLowLogLevel.trace(logMessages[5]);
            // Assert.
            const readInterface = readline.createInterface({
                input: fs.createReadStream(filePath)
            });
            let messageNumber = 0;
            readInterface.on('line', line => {
                const messageExists = line.includes(logMessages[messageNumber]);
                if (!messageExists) done('Not correct, did not find message.');
                messageNumber += 1;
                if (messageNumber === logMessages.length - 1) done();
                // Timeout means the required amount of messages to be read was not hit.
            });
        });
    });
    describe('Formatting', () => {
        it('should format output to json with callee', () => {
            // Setup.
            const filePath = getUniqueAbsoluteFilePath();
            const log = languramaLog({
                ...defaultFileConfiguration,
                path: filePath,
                json: true,
                callee: true
            });
            // Test.
            log.info('herro');
            // Assert.
            const result = getFirstLineFromFile(filePath);
            const test = () => JSON.parse(result);
            assert.doesNotThrow(test, `Expected JSON parsable log, received: ${result}`);
            assert(test().callee !== undefined, 'Property "callee" does not exist.');
        });
        it('should format output to json without callee', () => {
            // Setup.
            const filePath = getUniqueAbsoluteFilePath();
            const log = languramaLog({
                ...defaultFileConfiguration,
                path: filePath,
                json: true,
                callee: false
            });
            // Test.
            log.info('herro');
            // Assert.
            const result = getFirstLineFromFile(filePath);
            const test = () => JSON.parse(result);
            assert.doesNotThrow(test, `Expected JSON parsable log, received: ${result}`);
            assert(test().callee === undefined, 'Property "callee" exists.');
        });
        it('should format output with callee', () => {
            // Setup.
            const filePath = getUniqueAbsoluteFilePath();
            const log = languramaLog({
                ...defaultFileConfiguration,
                path: filePath,
                callee: true
            });
            console.log(path.join('log', 'test', 'index.node.spec.js'));
            const expectedResult = path.join('log', 'test', 'index.node.spec.js');
            // Test.
            log.info('herro');
            // Assert.
            const actualResult = getFirstLineFromFile(filePath);
            console.log(actualResult);

            assert(actualResult.includes(expectedResult));
        });
        it('should format output without callee', () => {
            // Setup.
            const filePath = getUniqueAbsoluteFilePath();
            const log = languramaLog({
                ...defaultFileConfiguration,
                path: filePath,
                callee: false
            });
            const expectedResult = new RegExp('log/test/index.node.spec.js');
            // Test.
            log.info('herro');
            // Assert.
            const actualResult = getFirstLineFromFile(filePath);
            assert(!expectedResult.test(actualResult));
        });
        it('should format timestamps correctly for single, double digit and different timezone dates', done => {
            // Setup.
            const logMessages = [
                'single-digit-date',
                'double-digit-date',
                'neutral-timezone',
                'negative-timezone',
                'positive-timezone'
            ];
            const filePath = getUniqueAbsoluteFilePath();
            const log = languramaLog({
                ...defaultFileConfiguration,
                callee: false,
                path: filePath
            });
            const singleDigitDate = new Date(1988, 1, 1, 1, 1, 1, 1, 1);
            const doubleDigitDate = new Date(1988, 10, 10, 10, 10, 10, 10, 10);
            const neutralTimezoneDate = new Date();
            neutralTimezoneDate.getTimezoneOffset = () => 0;
            const negativeTimezoneDate = new Date();
            negativeTimezoneDate.getTimezoneOffset = () => -120;
            const positiveTimezoneDate = new Date();
            positiveTimezoneDate.getTimezoneOffset = () => 120;
            // Test.
            info(singleDigitDate, log._transports, logMessages[0]);
            info(doubleDigitDate, log._transports, logMessages[1]);
            info(neutralTimezoneDate, log._transports, logMessages[2]);
            info(negativeTimezoneDate, log._transports, logMessages[3]);
            info(positiveTimezoneDate, log._transports, logMessages[4]);
            // Assert.
            const readInterface = readline.createInterface({
                input: fs.createReadStream(filePath)
            });
            let messageNumber = 0;
            readInterface.on('line', line => {
                const messageExists = line.includes(logMessages[messageNumber]);
                if (!messageExists) done('Not correct, did not find message.');
                const timestamp = getTimestamp(line);
                if (!timestampRegEx.test(timestamp)) done(`Timestamp format invalid: ${timestamp}`);
                messageNumber += 1;
                if (messageNumber === logMessages.length) done();
                // Timeout means the required amount of messages to be read was not hit.
            });
        });
        it('should format undefined data type to string correctly', () => {
            // Setup.
            const expectedResult = 'undefined';
            const filePath = getUniqueAbsoluteFilePath();
            const log = createFileLog(filePath);
            // Test.
            log.info(undefined);
            // Assert.
            const actualResult = getMessageFromLog(getFirstLineFromFile(filePath));
            assert.strictEqual(actualResult, expectedResult);
        });
        it('should format boolean data type to string correctly', () => {
            // Setup.
            const expectedResult = 'true';
            const filePath = getUniqueAbsoluteFilePath();
            const log = createFileLog(filePath);
            // Test.
            log.info(true);
            // Assert.
            const actualResult = getMessageFromLog(getFirstLineFromFile(filePath));
            assert.strictEqual(actualResult, expectedResult);
        });
        it('should format number data type to string correctly', () => {
            // Setup.
            const expectedResult = '4';
            const filePath = getUniqueAbsoluteFilePath();
            const log = createFileLog(filePath);
            // Test.
            log.info(4);
            // Assert.
            const actualResult = getMessageFromLog(getFirstLineFromFile(filePath));
            assert.strictEqual(actualResult, expectedResult);
        });
        it('should format number with decimals data type to string correctly', () => {
            // Setup.
            const expectedResult = '3.14';
            const filePath = getUniqueAbsoluteFilePath();
            const log = createFileLog(filePath);
            // Test.
            log.info(3.14);
            // Assert.
            const actualResult = getMessageFromLog(getFirstLineFromFile(filePath));
            assert.strictEqual(actualResult, expectedResult);
        });
        it('should format bigint data type to string correctly', () => {
            // Setup.
            const expectedResult = '9007199254740991';
            const filePath = getUniqueAbsoluteFilePath();
            const log = createFileLog(filePath);
            // Test.
            // TODO: Remove disable rule when BigInt exists.
            // eslint-disable-next-line no-undef
            log.info(BigInt('9007199254740991'));
            // Assert.
            const actualResult = getMessageFromLog(getFirstLineFromFile(filePath));
            assert.strictEqual(actualResult, expectedResult);
        });
        it('should format string data type correctly', () => {
            // Setup.
            const expectedResult = 'hello';
            const filePath = getUniqueAbsoluteFilePath();
            const log = createFileLog(filePath);
            // Test.
            log.info('hello');
            // Assert.
            const actualResult = getMessageFromLog(getFirstLineFromFile(filePath));
            assert.strictEqual(actualResult, expectedResult);
        });
        it('should format empty string data type correctly', () => {
            // Setup.
            const expectedResult = '';
            const filePath = getUniqueAbsoluteFilePath();
            const log = createFileLog(filePath);
            // Test.
            log.info('');
            // Assert.
            const actualResult = getMessageFromLog(getFirstLineFromFile(filePath));
            assert.strictEqual(actualResult, expectedResult);
        });
        it('should format symbol data type to string correctly', () => {
            // Setup.
            const expectedResult = 'Symbol(7)';
            const filePath = getUniqueAbsoluteFilePath();
            const log = createFileLog(filePath);
            // Test.
            log.info(Symbol(7));
            // Assert.
            const actualResult = getMessageFromLog(getFirstLineFromFile(filePath));
            assert.strictEqual(actualResult, expectedResult);
        });
        it('should format array type to string correctly', () => {
            // Setup.
            const expectedResult = '[1,3,7,,hello]';
            const filePath = getUniqueAbsoluteFilePath();
            const log = createFileLog(filePath);
            // Test.
            log.info([1, 3, 7, undefined, 'hello']);
            // Assert.
            const actualResult = getMessageFromLog(getFirstLineFromFile(filePath));
            assert.strictEqual(actualResult, expectedResult);
        });
        it('should format null type to string correctly', () => {
            // Setup.
            const expectedResult = 'null';
            const filePath = getUniqueAbsoluteFilePath();
            const log = createFileLog(filePath);
            // Test.
            log.info(null);
            // Assert.
            const actualResult = getMessageFromLog(getFirstLineFromFile(filePath));
            assert.strictEqual(actualResult, expectedResult);
        });
        it('should format object type to string correctly', () => {
            // Setup.
            const expectedResultMessages = ['{', '    "test": "test"', '}'];
            const expectedResultLineCount = 4;
            const filePath = getUniqueAbsoluteFilePath();
            const log = createFileLog(filePath);
            // Test.
            log.info({ test: 'test' });
            // Assert.
            const actualResultMessages = getFileContents(filePath).split('\n');
            actualResultMessages[0] = getMessageFromLog(actualResultMessages[0]);
            const actualResultLineCount = actualResultMessages.length;
            assert.strictEqual(actualResultMessages[0], expectedResultMessages[0]);
            assert.strictEqual(actualResultMessages[1], expectedResultMessages[1]);
            assert.strictEqual(actualResultMessages[2], expectedResultMessages[2]);
            assert.strictEqual(actualResultLineCount, expectedResultLineCount);
        });
        it('should format error data type to string correctly', () => {
            // Setup.
            const expectedResultMessage = 'Error: crap';
            const expectedResultLineCount = 9;
            const filePath = getUniqueAbsoluteFilePath();
            const log = createFileLog(filePath);
            // Test.
            log.info(new Error('crap'));
            // Assert.
            const fileContents = getFileContents(filePath).split('\n');
            const actualResultMessage = getMessageFromLog(fileContents[0]);
            const actualResultLineCount = fileContents.length;
            assert.strictEqual(actualResultMessage, expectedResultMessage);
            assert.strictEqual(actualResultLineCount, expectedResultLineCount);
        });
    });

    afterEach(() => {
        // Teardown.
        jest.clearAllMocks();
    });

    afterAll(() => {
        // Teardown.
        if (fs.existsSync(testLogDir)) fs.rmdirSync(testLogDir, { recursive: true });
    });
});

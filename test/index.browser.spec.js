/**
 * @jest-environment jsdom
 */

// Native modules.
import { default as assert } from 'assert';

// NPM modules.
import { default as chai } from 'chai';
import { default as spies } from 'chai-spies';
import { v4 as uuidv4 } from 'uuid';

// Local modules.
import {
    default as languramaLog,
    defaultFileConfiguration,
    defaultTerminalConfiguration
} from '../src';
// eslint-disable-next-line no-unused-vars
import { testLog } from './helper';

chai.use(spies);

describe('Browser', () => {
    describe('Configuration', () => {
        it('should create a log object with default configuration', () => {
            const element = document.createElement('div');
            expect(element).not.toBeNull();
        });
        it('should throw an error if a file configuration is given', () => {
            // Setup.
            const expectedResult = new RegExp(
                'Error: Browser may not have a file configuration, it may only include a terminal configuration.'
            );
            // Test.
            const test = () => languramaLog(defaultFileConfiguration);
            // Assert.
            assert.throws(test, expectedResult);
        });
        it('should write to console.error', done => {
            // Setup.
            const uuid = uuidv4();
            const logMessages = [`${uuid}_ne_browser`, `${uuid}_ce_browser`];
            const log = languramaLog();
            const logNoCallee = languramaLog({
                ...defaultTerminalConfiguration,
                level: 'error',
                callee: false
            });
            // Assert.
            let messageNumber = 0;
            chai.spy.on(console, 'error', function(...items) {
                if (items[1].includes(`${uuid}_`)) {
                    const messageExists = items[1].includes(logMessages[messageNumber]);
                    if (!messageExists) done('Not correct, did not find message.');
                    messageNumber += 1;
                    if (messageNumber === logMessages.length) done();
                    // Timeout means the required amount of messages to be read was not hit.
                }
            });
            // Test.
            log.error(logMessages[0]);
            logNoCallee.error(logMessages[1]);
        });
        it('should write to console.warn', done => {
            // Setup.
            const uuid = uuidv4();
            const logMessages = [`${uuid}_nw_browser`, `${uuid}_cw_browser`];
            const log = languramaLog();
            const logNoCallee = languramaLog({
                ...defaultTerminalConfiguration,
                level: 'warn',
                callee: false
            });
            // Assert.
            let messageNumber = 0;
            chai.spy.on(console, 'warn', function(...items) {
                if (items[1].includes(`${uuid}_`)) {
                    const messageExists = items[1].includes(logMessages[messageNumber]);
                    if (!messageExists) done('Not correct, did not find message.');
                    messageNumber += 1;
                    if (messageNumber === logMessages.length) done();
                    // Timeout means the required amount of messages to be read was not hit.
                }
            });
            // Test.
            log.warn(logMessages[0]);
            logNoCallee.warn(logMessages[1]);
        });
        it('should write to console.info', done => {
            // Setup.
            const uuid = uuidv4();
            const logMessages = [`${uuid}_ni_browser`, `${uuid}_ci_browser`];
            const log = languramaLog();
            const logNoCallee = languramaLog({
                ...defaultTerminalConfiguration,
                level: 'info',
                callee: false
            });
            // Assert.
            let messageNumber = 0;
            chai.spy.on(console, 'info', function(...items) {
                if (items[1].includes(`${uuid}_`)) {
                    const messageExists = items[1].includes(logMessages[messageNumber]);
                    if (!messageExists) done('Not correct, did not find message.');
                    messageNumber += 1;
                    if (messageNumber === logMessages.length) done();
                    // Timeout means the required amount of messages to be read was not hit.
                }
            });
            // Test.
            log.info(logMessages[0]);
            logNoCallee.info(logMessages[1]);
        });
        it('should write to console.debug', done => {
            // Setup.
            const uuid = uuidv4();
            const logMessages = [`${uuid}_nd_browser`, `${uuid}_cd_browser`];
            const log = languramaLog({
                ...defaultTerminalConfiguration,
                level: 'debug'
            });
            const logNoCallee = languramaLog({
                ...defaultTerminalConfiguration,
                level: 'debug',
                callee: false
            });
            // Assert.
            let messageNumber = 0;
            chai.spy.on(console, 'debug', function(...items) {
                if (items[1].includes(`${uuid}_`)) {
                    const messageExists = items[1].includes(logMessages[messageNumber]);
                    if (!messageExists) done('Not correct, did not find message.');
                    messageNumber += 1;
                    if (messageNumber === logMessages.length) done();
                    // Timeout means the required amount of messages to be read was not hit.
                }
            });
            // Test.
            log.debug(logMessages[0]);
            logNoCallee.debug(logMessages[1]);
        });
        it('should write to console.trace', done => {
            // Setup.
            const uuid = uuidv4();
            const logMessages = [`${uuid}_nt_browser`, `${uuid}_ct_browser`];
            const log = languramaLog({
                ...defaultTerminalConfiguration,
                level: 'trace'
            });
            const logNoCallee = languramaLog({
                ...defaultTerminalConfiguration,
                level: 'trace',
                callee: false
            });
            // Assert.
            let messageNumber = 0;
            chai.spy.on(console, 'trace', function(...items) {
                if (items[1].includes(`${uuid}_`)) {
                    const messageExists = items[1].includes(logMessages[messageNumber]);
                    if (!messageExists) done('Not correct, did not find message.');
                    messageNumber += 1;
                    if (messageNumber === logMessages.length) done();
                    // Timeout means the required amount of messages to be read was not hit.
                }
            });
            // Test.
            log.trace(logMessages[0]);
            logNoCallee.trace(logMessages[1]);
        });
    });
});

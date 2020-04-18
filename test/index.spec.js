// Native modules.
import { default as assert } from 'assert';

// Local modules.
import {
    default as basickarlLog,
    defaultTerminalConfiguration,
    defaultFileConfiguration
} from '../source';

describe('everything', () => {
    it('should create a log object with default configuration', () => {
        // Setup.
        const expectedResultArray = [defaultTerminalConfiguration];
        const expectedResultType = typeof expectedResultArray;
        // Test.
        const log = basickarlLog();
        const actualResultArray = log._configurations;
        const actualResultType = typeof actualResultArray;
        // Assert.
        assert.strictEqual(actualResultType, expectedResultType);
        assert.deepEqual(actualResultArray, expectedResultArray);
    });
    it('should create a log object that accepts an object terminal configuration', () => {
        // Setup.
        const expectedResultArray = [defaultTerminalConfiguration];
        const expectedResultType = typeof expectedResultArray;
        // Test.
        const log = basickarlLog(defaultTerminalConfiguration);
        const actualResultArray = log._configurations;
        const actualResultType = typeof actualResultArray;
        // Assert.
        assert.strictEqual(actualResultType, expectedResultType);
        assert.deepEqual(actualResultArray, expectedResultArray);
    });
    // it('should create a lob object with a file transport', () => {});
    // it('should create a log object with a terminal transport and a file transport', () => {});
    // it('should complain that the configuration is incorrect', () => {});
    // it('should', () => {});
});

/* // const log = new Log(
//     [
//         {
//             type: 'file',
//             path: './test/_logs/info_level.log',
//             callee: false,
//             level: 'INFO'
//         },
//         {
//             type: 'file',
//             path: './test/_logs/error_level.log',
//             level: 'ERROR',
//             json: true
//         },
//         {
//             type: 'terminal'
//         }
//     ],
//     { verbose: true }
// );
 */
// log.info('herro', 1, 3.4, null, undefined, [1, 9], new Error('crap'), true, {
//     wtf: 'k'
// });
// log.error(new Error('F*ck'));
// log.warn('This is a warning');
// log.info('God');
// log.debug('k.');
// log.trace('Yea you get the picture');

// const log = new Log('config.json', { verbose: true });

// log.info('herro', 1, 3.4, null, undefined, [1, 9], new Error('crap'), true, {
//     wtf: 'k'
// });
// log.error(new Error('F*ck'));
// log.warn('This is a warning');
// log.info('God');
// log.debug('k.');
// log.trace('Yea you get the picture');

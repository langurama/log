// NPM modules.
import { default as chalk } from 'chalk';

// Local modules.
import { default as basickarlLog } from '../source';

console.log('Example starting!');

console.log('Non-color example!');
const log = basickarlLog();

log.info('herro', 1, 3.4, null, undefined, [1, 9], new Error('crap'), true, { wtf: 'k' });
log.error(new Error('F*ck'));
log.warn('This is a warning');
log.info('God');
log.debug('k.');
log.trace('Yea you get the picture');

console.log('Color example!');
const logColor = basickarlLog({
    type: 'terminal',
    chalk
});

logColor.info('herro', 1, 3.4, null, undefined, [1, 9], new Error('crap'), true, { wtf: 'k' });
logColor.error(new Error('F*ck'));
logColor.warn('This is a warning');
logColor.info('God');
logColor.debug('k.');
logColor.trace('Yea you get the picture');

console.log('Example finished!');

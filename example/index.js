// NPM modules.
import { default as chalk } from 'chalk';

// Local modules.
import { default as languramaLog } from '../source';

console.log('Example starting!');

console.log('Non-color example!');
const log = languramaLog();

log.info('herro', 1, 3.4, null, undefined, [1, 9], new Error('crap'), true, { wtf: 'k' });
log.error(new Error('F*ck'));
log.warn('This is a warning');
log.info('God');
log.debug(`Won't show`);
log.trace(`Still won't show`);

console.log('Color example!');
const logColor = languramaLog({
    type: 'terminal',
    chalk,
    level: 'trace'
});

logColor.info('herro', 1, 3.4, null, undefined, [1, 9], new Error('crap'), true, { wtf: 'k' });
logColor.error(new Error('F*ck'));
logColor.warn('This is a warning');
logColor.info('God');
logColor.debug('k.');
logColor.trace('Yea you get the picture');

console.log('File example!');
const logFile = languramaLog({
    type: 'file',
    path: './example/log/456456/example.log',
    level: 'trace'
});

logFile.info('herro', 1, 3.4, null, undefined, [1, 9], new Error('crap'), true, { wtf: 'k' });
logFile.error(new Error('F*ck'));
logFile.warn('This is a warning');
logFile.info('God');
logFile.debug('k.');
logFile.trace('Yea you get the picture');

console.log('Example finished!');

const Log = require('../src/index');

let log = new Log(
    [
        {
            type: 'file',
            path: 'logs/foo2.log',
            callee: false,
            level: 'INFO'
        },
        {
            type: 'file',
            path: 'logs/foo1.log',
            level: 'ERROR',
            json: true
        },
        {
            type: 'terminal'
        }
    ],
    { verbose: true }
);

log.info('herro', 1, 3.4, null, undefined, [1, 9], new Error('crap'), true, {
    wtf: 'k'
});
log.error(new Error('F*ck'));
log.warn('This is a warning');
log.info('God');
log.debug('k.');
log.trace('Yea you get the picture');

log = new Log('config.json', { verbose: true });

log.info('herro', 1, 3.4, null, undefined, [1, 9], new Error('crap'), true, {
    wtf: 'k'
});
log.error(new Error('F*ck'));
log.warn('This is a warning');
log.info('God');
log.debug('k.');
log.trace('Yea you get the picture');

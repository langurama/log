// NPM modules.
const chalk = require('chalk');

// Local modules.
const languramaLog = require('../dist/').default;

console.log('Example starting!');

console.log('CommonJS example!');
const log = languramaLog({
    type: 'terminal',
    chalk,
    level: 'trace'
});
log.error(new Error('CommonJS'));

console.log('Example finished!');

// Local modules.
import basickarlLog, { default as basickarlLogTwo, create as basickarlLogThree } from '../source';

const log = basickarlLog();

log.info('hello');

const logTwo = basickarlLogTwo();

logTwo.info('hello');

const logThree = basickarlLogThree();

logThree.info('hello');

console.log('running');

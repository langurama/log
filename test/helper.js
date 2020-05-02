// Native modules.
import { default as fs } from 'fs';
import { default as path } from 'path';

/* istanbul ignore next */
export function testLog(message) {
    fs.appendFileSync(path.join(process.cwd(), 'test.log'), `${message}\n`);
}

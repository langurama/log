# @langurama/log

[![Build](https://img.shields.io/github/workflow/status/langurama/log/Langurama%20Log?style=for-the-badge)](https://github.com/langurama/log/actions?query=workflow%3A%22Langurama+Log%22)
[![Coverage](https://img.shields.io/codecov/c/github/langurama/log?style=for-the-badge)](https://codecov.io/gh/langurama/log/branch/master)
[![Version](https://img.shields.io/npm/v/@langurama/log.svg?style=for-the-badge)](https://www.npmjs.com/package/@langurama/log)
[![License](https://img.shields.io/npm/l/@langurama/log.svg?style=for-the-badge)](https://github.com/langurama/log/blob/master/LICENSE)

Due to the retardedness of some of the libraries not providing a _simple_ human readable logging library, which can log to file and stdout/stderr, I had to tell someone to hold my beer so I could.

## Contents.

-   [ Install ](#install)
-   [ Configuration ](#configuration)
-   [ Example ](#example)
-   [ How it works ](#how-it-works)

<a name="install"></a>

## Install

```
npm install --save-prod --save-exact @langurama/log
```

<a name="configuration"></a>

## Configuration

-   Terminal transport works in both Node.js and the browser.
-   File transport works only in Node.js.

### \<LanguramaLog\>

#### languramaLog(configuration)

-   configuration **\<LanguramaConfiguration\> | <LanguramaConfiguration[]>** _Default: LanguramaConfiguration_
    -   LanguramaConfiguration **<LanguramaTerminalConfiguration | LanguramaFileConfiguration>** _Default: LanguramaTerminalConfiguration_
        -   LanguramaTerminalConfiguration **\<Object\>** _Only one per log instance._
            -   type **\<string\>** Valid values: [terminal] **Required**
            -   level **\<string\>** Valid values: [error, warn, info, debug, trace] _Default: info_
            -   callee **\<boolean\>** _Default: true_
            -   chalk **\<Chalk\>** _Display logs in terminal in color using the Chalk module instance._
        -   LanguramaFileConfiguration **\<Object\>**
            -   type **\<string\>** Valid values: [file] **Required**
            -   level **\<string\>** Valid values: [error, warn, info, debug, trace] _Default: info_
            -   path **\<string\>** _Path where log should be written to._ _Default: ./log/application.log_
            -   json **\<boolean\>** _Write to log file in JSON format._ _Default: false_
-   Returns: **\<LanguramaLog\>**

### \<LanguramaLog\>

#### error([...messages])

-   messages **<string | undefined | null | boolean | number | bigint | Object | Symbol | Error>** _Writes to stderr._

#### warn([...message])

-   messages **<string | undefined | null | boolean | number | bigint | Object | Symbol | Error>** _Writes to stderr._

#### info([...message])

-   messages **<string | undefined | null | boolean | number | bigint | Object | Symbol | Error>** _Writes to stdout._

#### debug([...message])

-   messages **<string | undefined | null | boolean | number | bigint | Object | Symbol | Error>** _Writes to stdout._

#### trace([...message])

-   messages **<string | undefined | null | boolean | number | bigint | Object | Symbol | Error>** _Writes to stdout._

<a name="example"></a>

## Example

You may check the `example/` directory for an runnable example files.

Example output:

```
import { default as languramaLog } from 'log';
import { default as chalk } from 'chalk'; // If you want to have colors in the terminal.

const log = languramaLog([
    {
        type: 'file',
        path: 'log/foo2.log',
        callee: false,
        level: 'error'
    },
    {
        type: 'file',
        path: 'log/foo1.log',
        level: 'warn',
        json: true
    },
    {
        type: 'terminal',
        level: 'debug',
        callee: true,
        chalk
    }
]);

log.info('herro', 1, 3.4, null, undefined, [1, 9], new Error('crap'), true, { wtf: 'k' });
log.error(new Error('F*ck'));
log.warn('This is a warning.');
log.info('God.');
log.debug('k.');
log.trace('This will not be displayed.');
```

Will result in the following.

Terminal:

```
2020-05-02 15:24:27 UTC+2   INFO herro 1 3.4 null undefined [1,9] Error: crap
    at Object.<anonymous> (/home/karl/dev/log/example/index.js:73:52)
    at Module._compile (internal/modules/cjs/loader.js:955:30)
    at Module._compile (/home/karl/dev/log/node_modules/pirates/lib/index.js:99:24)
    at Module._extensions..js (internal/modules/cjs/loader.js:991:10)
    at Object.newLoader [as .js] (/home/karl/dev/log/node_modules/pirates/lib/index.js:104:7)
    at Module.load (internal/modules/cjs/loader.js:811:32)
    at Function.Module._load (internal/modules/cjs/loader.js:723:14)
    at Function.Module.runMain (internal/modules/cjs/loader.js:1043:10)
    at Object.<anonymous> (/home/karl/dev/log/node_modules/@babel/node/lib/_babel-node.js:180:21)
    at Module._compile (internal/modules/cjs/loader.js:955:30) true {
    "wtf": "k"
} /home/karl/dev/log/example/index.js:73:5
2020-05-02 15:24:27 UTC+2  ERROR Error: F*ck
    at Object.<anonymous> (/home/karl/dev/log/example/index.js:74:11)
    at Module._compile (internal/modules/cjs/loader.js:955:30)
    at Module._compile (/home/karl/dev/log/node_modules/pirates/lib/index.js:99:24)
    at Module._extensions..js (internal/modules/cjs/loader.js:991:10)
    at Object.newLoader [as .js] (/home/karl/dev/log/node_modules/pirates/lib/index.js:104:7)
    at Module.load (internal/modules/cjs/loader.js:811:32)
    at Function.Module._load (internal/modules/cjs/loader.js:723:14)
    at Function.Module.runMain (internal/modules/cjs/loader.js:1043:10)
    at Object.<anonymous> (/home/karl/dev/log/node_modules/@babel/node/lib/_babel-node.js:180:21)
    at Module._compile (internal/modules/cjs/loader.js:955:30) /home/karl/dev/log/example/index.js:74:5
2020-05-02 15:24:27 UTC+2   WARN This is a warning. /home/karl/dev/log/example/index.js:75:5
2020-05-02 15:24:27 UTC+2   INFO God. /home/karl/dev/log/example/index.js:76:5
2020-05-02 15:24:27 UTC+2  DEBUG k. /home/karl/dev/log/example/index.js:77:5
```

File `log/foo1.log`:

```
2020-05-02 15:56:39 UTC+2 ERROR Error: F*ck
    at Object.<anonymous> (/home/karl/dev/log/example/index.js:74:11)
    at Module._compile (internal/modules/cjs/loader.js:955:30)
    at Module._compile (/home/karl/dev/log/node_modules/pirates/lib/index.js:99:24)
    at Module._extensions..js (internal/modules/cjs/loader.js:991:10)
    at Object.newLoader [as .js] (/home/karl/dev/log/node_modules/pirates/lib/index.js:104:7)
    at Module.load (internal/modules/cjs/loader.js:811:32)
    at Function.Module._load (internal/modules/cjs/loader.js:723:14)
    at Function.Module.runMain (internal/modules/cjs/loader.js:1043:10)
    at Object.<anonymous> (/home/karl/dev/log/node_modules/@babel/node/lib/_babel-node.js:180:21)
    at Module._compile (internal/modules/cjs/loader.js:955:30)
```

File `log/foo2.log`:

```
{"timestamp":"2020-05-02 15:56:39 UTC+2","level":"ERROR","message":"Error: F*ck\n    at Object.<anonymous> (/home/karl/dev/log/example/index.js:74:11)\n    at Module._compile (internal/modules/cjs/loader.js:955:30)\n    at Module._compile (/home/karl/dev/log/node_modules/pirates/lib/index.js:99:24)\n    at Module._extensions..js (internal/modules/cjs/loader.js:991:10)\n    at Object.newLoader [as .js] (/home/karl/dev/log/node_modules/pirates/lib/index.js:104:7)\n    at Module.load (internal/modules/cjs/loader.js:811:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:723:14)\n    at Function.Module.runMain (internal/modules/cjs/loader.js:1043:10)\n    at Object.<anonymous> (/home/karl/dev/log/node_modules/@babel/node/lib/_babel-node.js:180:21)\n    at Module._compile (internal/modules/cjs/loader.js:955:30)"}
{"timestamp":"2020-05-02 15:56:39 UTC+2","level":"WARN","message":"This is a warning."}
```

<a name="how-it-works"></a>

## How it works

This package transpiles code to `CommonJS` via `Babel` targeted at the current `Node.js` LTS version. To use this in the browser you will need to transpile it from `CommonJS` to your targeted browser(s).

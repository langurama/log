// const schema = {
//     doc: 'Configuration argument type',
//     default: null,
//     format: 'Array',
//     values: [
//         {
//             callee: 'common.callee',
//             level: 'common.level',
//             type: {
//                 doc: 'Transport type',
//                 format: 'String',
//                 values: ['url'],
//                 default: null
//             },
//             url: {
//                 doc: '-',
//                 format: 'String',
//                 default: null
//             }
//         },
//         {
//             callee: 'common.callee',
//             level: 'common.level',
//             type: {
//                 doc: 'Transport type.',
//                 format: 'String',
//                 values: ['terminal'],
//                 default: null
//             }
//         },
//         {
//             callee: 'common.callee',
//             json: {
//                 doc: 'Save the message in JSON format',
//                 format: 'Boolean',
//                 default: false
//             },
//             level: 'common.level',
//             path: {
//                 doc: 'Path to where the log will be saved to',
//                 format: 'String',
//                 default: null
//             },
//             type: {
//                 doc: 'Transport type',
//                 format: 'String',
//                 values: ['file'],
//                 default: null
//             }
//         }
//     ],
//     common: {
//         level: {
//             doc: 'Log level of transport',
//             format: 'String',
//             values: ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'],
//             default: 'INFO'
//         },
//         callee: {
//             doc:
//                 'The file and line where the log was called to be included in the log message',
//             format: 'Boolean',
//             default: false
//         }
//     }
// };

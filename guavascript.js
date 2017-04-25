// Largely based off of Toal's Plainscript example...
// TODO: Add functionality with future homeworks.

const argv = require('yargs')
    .usage('$0 [-a] [-s] [--js] filename')
    .boolean(['a', 's', 'js'])
    .describe('a', 'parse, then generate an AST')
    .describe('s', 'perform semantic analysis')
    .describe('js', 'generate program in JavaScript')
    .demand(1)
    .argv;

const usageString = `Guavascript Usage:

node guavascript.js -a <filename>
    The '-a' option prints the abstract syntax tree.

node guavascript.js -s <filename>
    The '-s' option runs a complete semantic analysis and prints errors, if any.

node guavascript.js --js <filename>
    The '--js' option generates the program in JavaScript after running semantic and grammar checks.

node guavascript.js --js <filename> | node
    When using the '--js' option, the output code can be piped to node to be run.`

const fs = require('fs');
const path = require('path');
const parser = require('./parser.js');

fs.readFile(argv._[0], 'utf-8', (err, text) => {
    let program = parser(text);
    if (argv.a) {
        console.log(program.toString());
        return;
    } if (argv.s | argv.js) {
        program.analyze();
        if(argv.js) {
            const generator = require(`./generators/javascript-generator.js`);
            let baseCode = generator(program);
            console.log(baseCode);
        }
    }
});

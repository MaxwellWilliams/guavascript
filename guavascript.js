// Largely based off of Toal's Plainscript example...

const argv = require('yargs')
    .usage('$0 [-a] filename')
    .boolean(['a'])
    .describe('a', 'parse, then print abstract syntax tree')
    .demand(1)
    .argv;

const usageString = `Guavascript Usage:
./guavascript.js -a <filename>
    The '-a' option prints the abstract syntax tree.`

const fs = require('fs');
const path = require('path');
const parse = require(path.resolve('./guavascript_AST_generator.js'));

fs.readFile(argv._[0], 'utf-8', (err, text) => {
    let program = parse(text);
    if (argv.a) {
        console.log(program.toString());
        return;
    } else {
        console.log(usageString);
    }
})

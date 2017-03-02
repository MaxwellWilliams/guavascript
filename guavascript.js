path = require('path');
parser = require(path.resolve('./guavascript_AST_generator.js'));

args = process.argv;
filePath = args[2];
fileContents = fs.readFileSync(filePath, 'utf-8');

console.log(parser(fileContents));
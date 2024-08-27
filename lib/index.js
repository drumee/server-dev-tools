const { exit } = process;
const JSON_OPT = { spaces: 2, EOL: "\r\n" };
const parser = require('yargs/yargs')(process.argv.slice(2));
const argv = parser.parse();
const action = argv._[0] || 'list';
const { writeFileSync } = require(`jsonfile`);

function failed(msg) {
  console.error(msg);
  exit(1);
}
function writeConfigs(file, data, trace = 0) {
  console.log(`Writing data into ${file}`);
  if (trace) {
    console.log(data)
  }
  writeFileSync(file, data, JSON_OPT);
}

module.exports = {
  failed, parser, JSON_OPT, action, argv, writeConfigs
}

#!/usr/bin/env node
const { resolve, join } = require("path");
const { existsSync, watch } = require("fs");
const { SRC_PATH } = process.env;
const { exit } = process;
const { exec } = require('shelljs');
const p = require('yargs/yargs')(process.argv.slice(2));
const argv = p.parse();

if (!argv.dir) {
  if (SRC_PATH) {
    argv.dir = SRC_PATH;
  } else {
    argv.dir = resolve(__dirname, '../../../..');
  }
}

if (!existsSync(argv.dir)) {
  console.log(`Could not watch ${argv.dir}, directory not found`);
  exit(1);
}
console.log(`Watching changes on ${argv.dir}`);
watch(argv.dir, {
  encoding: 'utf8', recursive: true
}, (e, filename) => {
  let cmd = join(__dirname, "handler")
  exec(`${cmd} ${argv.onChange}`)
});



#!/usr/bin/env node

const { writeFileSync, readFileSync } = require(`jsonfile`);
const { join, basename } = require("path");
const { exit } = process;
const {
  existsSync
} = require("fs");

const JSON_OPT = { spaces: 2, EOL: "\r\n" };
const argv = require('yargs/yargs')(process.argv.slice(2))
  .usage('Usage: $0 --plugin=/path/to/plugin/dir --endpoint=[main]')
  .default('endpoint', "main")
  .parse();
let { _, plugin, endpoint } = argv;
const action = _[0] || 'add';
plugin = plugin.replace(/\/+$/, '');

function failed(msg) {
  console.error(msg);
  exit(1);
}

let confFile = join("/etc/drumee/conf.d/plugins", `${endpoint}.json`)
let plugins = readFileSync(confFile) || { acl: [] };
const actions = {
  add: async function () {
    if (plugins.acl.includes(plugin)) {
      console.warn(`Plugin ${plugin} already exists.`);
    } else {
      if (!existsSync(plugin)) {
        failed(`Plugin ${plugin} was not found`);
        return;
      }
      plugins.acl.push(plugin);
      const acl = join(plugin, `acl`);
      const service = join(plugin, `serviceacl`);
      if (!existsSync(acl)) {
        failed(`No directory "acl" was found under ${plugin}`);
        return;
      }
      if (!existsSync(service)) {
        failed(`No directory "service" was found under ${plugin}`);
        return;
      }
      console.log(`Writing data into ${confFile}`, plugins);
      writeFileSync(confFile, plugins, JSON_OPT);
    }
  },
  remove: async function () {
    plugins.acl = plugins.acl.filter(function (e) {
      return e != plugin;
    })
    console.log(`Writing data into ${confFile}`, plugins);
    writeFileSync(confFile, plugins, JSON_OPT);
  },
  list: async function () {
    console.log(plugins.acl);
  }
}

const cmd = actions[action];
if (cmd) {
  cmd()
    .then(() => {
      exit(0);
    })
    .catch((e) => {
      console.error("Failed to setup Drumee infra", e);
      exit(0);
    });
}else{
  console.log(`Invalid command ${action}\n`, `Usage : ${basename(argv.$0)} add|remove|list`);
}


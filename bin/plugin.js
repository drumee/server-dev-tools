#!/usr/bin/env node

const { readFileSync } = require(`jsonfile`);
const { join, basename } = require("path");
const {
  existsSync
} = require("fs");

const { writeConfigs, failed, parser, action } = require("../lib");

let argv = {};
if (/^(add|remove)$/.test(action)) {
  argv = parser
    .usage('Usage: $0 add|remove --plugin=/path/to/plugin/dir --endpoint=[main]')
    .default('endpoint', 'main')
    .demandOption("plugin")
    .parse();
}else{
  argv = parser
    .usage('Usage: $0 list --endpoint=[main]')
    .default('endpoint', 'main')
    .parse();
}
let { plugin, endpoint } = argv;

let confFile = join("/etc/drumee/conf.d/plugins", `${endpoint}.json`);
if(!existsSync(confFile)){
  failed(`No plugin was installed for endpoint ${endpoint}`);
}
let plugins = readFileSync(confFile) || { acl: [] };
const actions = {
  add: function () {
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
      writeConfigs(confFile, plugins);
    }
  },
  remove: function () {
    plugins.acl = plugins.acl.filter(function (e) {
      return e != plugin;
    })
    writeConfigs(confFile, plugins);
  },
  list: function () {
    console.log(plugins.acl);
  }
}

const cmd = actions[action];
if (cmd) {
  cmd();
} else {
  console.log(`Invalid command ${action}\n`, `Usage : ${basename(argv.$0)} add|remove|list`);
}


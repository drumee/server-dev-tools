#!/usr/bin/env node

const { readFileSync } = require(`jsonfile`);
const { join, basename } = require("path");
const { sysEnv, Template } = require("@drumee/server-essentials");
const { writeConfigs, parser, action } = require("../lib");
const infra_dir = "/etc/drumee/infrastructure";
const confFile = join(infra_dir, "ecosystem.json");

let argv = {};
if (/^(add|remove)$/.test(action)) {
  argv = parser
    .usage('Usage: $0 --endpoint=<endpoint_name> --instances=[1]')
    .default('instances', 1)
    .demandOption("endpoint")
    .parse();
}

const { endpoint, instances } = argv;
const routeFile = join(infra_dir, "route", `${endpoint}.conf`);

let endpoints = readFileSync(confFile) || { acl: [] };
/**
 *
 * @param {*} data
 * @returns
 */
function worker(data, instances = 1) {
  let {
    script,
    pushPort,
    route,
    restPort,
    name,
    server_dir,
    runtime_dir,
  } = data;
  if (!server_dir) server_dir = join(runtime_dir, 'server');
  let base = `${server_dir}/dist/${route}`;
  let exec_mode = 'fork_mode';
  if (instances > 1) {
    exec_mode = 'cluster_mode';
  }
  return {
    name,
    script,
    cwd: base,
    args: `--pushPort=${pushPort} --restPort=${restPort}`,
    route,
    env: {
      cwd: base,
      route,
      server_home: base,
    },
    dependencies: [`pm2-logrotate`],
    exec_mode,
    instances
  };
}

function getAvailablePushPort() {
  let res = [];

  for (let e of endpoints) {
    if (/pushPort/.test(e.args)) {
      let opt = e.args.replace(/\-+/g, '');
      let [pushPort] = opt.split(/ +/);
      res.push(parseInt(pushPort.replace(/^.+=/, '')));
    }
  }
  return Math.max(...res) + 1;
}

const actions = {
  add: function () {
    let pushPort = getAvailablePushPort();
    let restPort = pushPort + 1000;
    const env = sysEnv();
    let main = worker({
      ...env,
      route: endpoint,
      name: endpoint,
      restPort,
      pushPort,
      script: "./index.js"
    });
    let service = worker({
      ...env,
      route: endpoint,
      name: `${endpoint}/service`,
      restPort,
      pushPort,
      script: "./service.js"
    }, instances);
    endpoints.push(main);
    endpoints.push(service);
    console.log({ out: routeFile, tpl: join(__dirname, "../templates/route.conf") })
    writeConfigs(confFile, endpoints);
    let d = new Date();
    let date = d.toISOString().split('T')[0];
    const out = routeFile;
    const tpl = join(__dirname, "../templates/route.conf");
    Template.write({ ...env, restPort, pushPort, endpoint, date }, { out, tpl })
  },
  remove: function () {
    endpoints = endpoints.filter(function (e) {
      return (!e.route || e.route != endpoint);
    })
    writeConfigs(confFile, endpoints);
  },
  list: function () {
    console.log(endpoints);
  }
}

const cmd = actions[action];
if (cmd) {
  cmd();
} else {
  console.log(`Invalid command ${action}\n`, `Usage : ${basename(argv.$0)} add|remove|list`);
}


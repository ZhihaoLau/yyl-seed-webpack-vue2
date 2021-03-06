const opzer = require('./lib/optimize.js');
const init = require('./lib/init.js');
const pkg = require('./package.json');
const make = require('./lib/make.js');
const cmd = {
  name: 'webpack-vue2',
  version: pkg.version,
  path: __dirname,
  examples: init.examples,
  optimize: opzer,
  init: init,
  make: make
};

module.exports = cmd;


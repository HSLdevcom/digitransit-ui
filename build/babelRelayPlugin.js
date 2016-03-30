const getbabelRelayPlugin = require('babel-relay-plugin');

module.exports = getbabelRelayPlugin(require('./schema.json'));

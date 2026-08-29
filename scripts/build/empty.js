// Stub module aliased in place of Node core `net` / `tls` for the browser bundle.
// Replaces webpack's `node: { net: 'empty', tls: 'empty' }`. `mqtt` (pulled in via a
// dynamic import in app/util/mqttClient.js) references these only on the Node code path;
// its own `browser` field already maps them to `false`, so this is a belt-and-braces alias.
module.exports = {};

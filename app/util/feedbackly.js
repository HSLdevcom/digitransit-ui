/* eslint-disable no-underscore-dangle */

let loaded = false;

const _FblyInst = {};
function Fbly(udid) {
  this.queue = [];
  this.udid = udid;
  const objUid =
    udid + (new Date().getTime() + Math.floor(1e3 * Math.random()));
  _FblyInst[objUid] = this;
}

const events = ['open', 'close', 'addMeta', 'removeMeta'];

for (let i = 0; i < events.length; i++) {
  const j = events[i];
  Fbly.prototype[j] = function() {
    this.queue.push([j, arguments]); // eslint-disable-line prefer-rest-params
  };
}

if (!loaded && _FblyInst) {
  loaded = true;
  window.Fbly = Fbly;
  window._FblyInst = _FblyInst;

  const el = document.createElement('script');
  el.type = 'text/javascript';
  el.async = true;
  el.defer = true;
  el.onload = function loadFbly() {
    window.plugin_592c0ccb45d721000e77f7bc = new window.Fbly(
      '592c0ccb45d721000e77f7bc',
    );
  };
  el.src = `${'https://survey.feedbackly.com/dist/plugin-v2.min.js?id='}${new Date().getTime()}`;
  document.getElementsByTagName('body')[0].appendChild(el);
}

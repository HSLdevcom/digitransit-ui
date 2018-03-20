const async = require('async');

// TODO: add citybikes back in april
const modalities = [
  'bus',
  'tram',
  'rail',
  'subway',
  'ferry',
  /* 'citybike', */ 'airplane',
];

function openQuickSettings() {
  this.waitForElementVisible(
    '@openQuickSettings',
    this.api.globals.elementVisibleTimeout,
  );
  this.api.checkedClick(this.elements.openQuickSettings.selector);

  this.waitForElementVisible(
    '@closeQuickSettings',
    this.api.globals.elementVisibleTimeout,
  );
  return this;
}

function closeQuickSettings() {
  this.waitForElementVisible(
    '@closeQuickSettings',
    this.api.globals.elementVisibleTimeout,
  );
  this.api.checkedClick(this.elements.closeQuickSettings.selector);
  this.waitForElementVisible(
    '@openQuickSettings',
    this.api.globals.elementVisibleTimeout,
  );
}

function exists(selector, callback) {
  this.api.elements('css selector', selector, result => {
    if (result.value && result.value.length > 0 && result.value[0].ELEMENT) {
      callback(selector, true);
    } else {
      callback(selector, false);
    }
  });
}

function enableModality(mode) {
  this.api.debug(`enabling ${mode}`);
  exists.call(this, `.toggle-modes>.btn-bar>.${mode}`, (selector, found) => {
    if (!found) {
      const nth = modalities.indexOf(mode) + 1;
      this.checkedClick(`.toggle-modes>.btn-bar>.btn:nth-of-type(${nth})`);
    }
  });
  this.waitForElementPresent(
    `.toggle-modes > .btn-bar > .${mode}`,
    this.api.globals.elementVisibleTimeout,
  );
}

function disableModality(mode, asyncCallback = () => {}) {
  this.api.debug(`disabling ${mode}`);
  exists.call(this, `.toggle-modes>.btn-bar>.${mode}`, (selector, found) => {
    if (found) {
      this.checkedClick(selector);
    }
  });
  this.waitForElementNotPresent(
    `.toggle-modes > .btn-bar > .${mode}`,
    this.api.globals.elementVisibleTimeout,
    true,
    () => {
      asyncCallback();
    },
  );
}

function disableAllModalitiesExcept(except) {
  this.api.debug(`disabling all but ${except}`);

  async.eachSeries(modalities, (modality, callback) => {
    this.api.pause(this.api.globals.pause_ms);
    this.api.debug(`iterating ${modality}`);
    if (modality !== except) {
      disableModality.call(this, modality, callback);
    }
  });
  this.api.debug('all iterated');
}

module.exports = {
  commands: [
    {
      openQuickSettings,
      closeQuickSettings,
      enableModality,
      disableModality,
      disableAllModalitiesExcept,
      exists,
    },
  ],
  elements: {
    openQuickSettings: 'button.settings',
    closeQuickSettings: 'button.close',
  },
};

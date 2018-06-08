// TODO: remove citybikes on 2018-10-31
const modalities = [
  'bus',
  'tram',
  'rail',
  'subway',
  'ferry',
  'citybike',
  'airplane',
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
  const modeSelector = `.toggle-modes>.btn-bar>.${mode}`;
  exists.call(this, modeSelector, (selector, found) => {
    if (!found) {
      const nth = modalities.indexOf(mode) + 1;
      this.checkedClick(`.toggle-modes>.btn-bar>.btn:nth-of-type(${nth})`);
    }
  });
  this.waitForElementPresent(
    modeSelector,
    this.api.globals.elementVisibleTimeout,
  );
}

function disableModality(mode) {
  this.api.debug(`disabling ${mode}`);
  const modeSelector = `.toggle-modes>.btn-bar>.${mode}`;
  exists.call(this, modeSelector, (selector, found) => {
    if (found) {
      this.waitForElementPresent(
        modeSelector,
        this.api.globals.elementVisibleTimeout,
      );
      this.waitForElementVisible(
        modeSelector,
        this.api.globals.elementVisibleTimeout,
      );
      this.checkedClick(modeSelector);
    }
  });
  this.waitForElementNotPresent(
    modeSelector,
    this.api.globals.elementVisibleTimeout,
  );
}

function disableAllModalitiesExcept(except) {
  this.api.debug(`disabling all but ${except}`);

  modalities.forEach(modality => {
    this.api.debug(`iterating ${modality}`);
    if (modality !== except) {
      disableModality.call(this, modality);
      this.api.pause(5 * this.api.globals.pause_ms);
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

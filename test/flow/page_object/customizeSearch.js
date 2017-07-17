const async = require('async');

const modalities = ['bus', 'tram', 'rail', 'subway', 'ferry', 'citybike', 'airplane'];

function clickCanvasToggle() {
  this.waitForElementVisible('@canvasToggle', this.api.globals.elementVisibleTimeout);
  return this.api.checkedClick(this.elements.canvasToggle.selector);
}

function closeCanvas() {
  this.waitForElementVisible('@closeCanvas', this.api.globals.elementVisibleTimeout);
  return this.api.checkedClick(this.elements.closeCanvas.selector);
}

function exists(selector, callback) {
  this.api.elements('css selector', selector, (result) => {
    if (result.value && result.value.length > 0 && result.value[0].ELEMENT) {
      callback(selector, true);
    } else {
      callback(selector, false);
    }
  });
}

function enableModality(modality) {
  this.api.debug(`enabling ${modality}`);
  exists.call(this, `.btn-bar > .${modality}`, (selector, found) => {
    if (!found) {
      this.checkedClick(`.btn-bar > .btn:nth-of-type(${modalities.indexOf(modality) + 1})`);
    }
  });
  this.waitForElementPresent(`.btn-bar > .${modality}`, this.api.globals.elementVisibleTimeout);
}

function disableModality(modality, asyncCallback = () => {}) {
  this.api.debug(`disabling ${modality}`);
  exists.call(this, `.btn-bar > .${modality}`, (selector, found) => {
    if (found) {
      this.checkedClick(selector);
    }
  });
  this.waitForElementNotPresent(`.btn-bar > .${modality}`,
    this.api.globals.elementVisibleTimeout, true, () => {
      asyncCallback();
    });
}

function disableAllModalitiesExcept(except) {
  this.api.debug(`disabling all but ${except}`);

  async.eachSeries(modalities, (modality, callback) => {
    this.api.pause(1000);
    this.api.debug(`iterating ${modality}`);
    if (modality !== except) {
      disableModality.call(this, modality, callback);
    }
  });
  this.api.debug('all iterated');
}

module.exports = {
  commands: [{
    clickCanvasToggle,
    enableModality,
    disableModality,
    disableAllModalitiesExcept,
    exists,
    closeCanvas,
  }],
  elements: {
    canvasToggle: '.right-offcanvas-toggle',
    closeCanvas: '.offcanvas-close',
  },
};

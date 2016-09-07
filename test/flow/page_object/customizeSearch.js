const modalities = ['bus', 'tram', 'rail', 'subway', 'ferry', 'citybike', 'airplane'];

function clickCanvasToggle() {
  return this.click('@canvasToggle');
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
  exists.call(this, `.btn-bar > .${modality}`, (selector, found) => {
    if (!found) {
      this.click(`.btn-bar > .btn:nth-of-type(${modalities.indexOf(modality) + 1})`);
    }
  });
}

function disableModality(modality) {
  exists.call(this, `.btn-bar > .${modality}`, (selector, found) => {
    if (found) {
      this.click(selector);
    }
  });
}

function disableAllModalitiesExcept(except) {
  modalities.forEach((modality) => {
    if (modality !== except) {
      disableModality.call(this, modality);
    }
  });
}

module.exports = {
  commands: [{
    clickCanvasToggle,
    enableModality,
    disableAllModalitiesExcept,
    exists,
  }],
  elements: {
    canvasToggle: '.right-offcanvas-toggle',
  },
};

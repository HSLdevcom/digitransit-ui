'use strict'

var modalities = ["tram", "rail", "bus", "air", "citybike", "ferry", "subway"];

var commands = {
  clickCanvasToggle: function() {
    return this.click("@canvasToggle");
  },
  enableModality: function(modality) {
    this.click(".btn-bar > .btn:nth-of-type(6)");
  },
  disableAllModalitiesExcept: function(exception) {
    var modality = "tram";
    for (var i in modalities) {
      var modality = modalities[i];
      var selector = ".btn-bar > ." + modality;
      var client = this;

      if(exception !== modality) {
        this.exists(selector, function(selector) {
          console.log("Clicking "+selector);
          client.click(selector);
        });
      }
    }
  },
  exists: function(selector, callback) {
    this.api.elements("css selector", selector, function(result) {
      if(result.value && result.value.length > 0 && result.value[0].ELEMENT) {
        callback(selector);
      }
    });
  }
};

module.exports = {
  commands: [commands],
  elements: {
    canvasToggle: ".right-off-canvas-toggle"
  }
};

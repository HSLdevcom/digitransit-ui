'use strict'

var modalities = ["bus", "tram", "rail", "subway", "ferry", "citybike", "air"];

var commands = {
  clickCanvasToggle: function() {
    return this.click("@canvasToggle");
  },
  enableModality: function(modality) {
    var index;
    for(var i in modalities) {
      if(modalities[i] === modality) {
        i++;
        var client = this;
        this.exists(".btn-bar > ." + modality, function(selector, found) {
          if(!found) {
            console.log("activating modality " + modality);
            client.click(".btn-bar > .btn:nth-of-type(" + i + ")");
            return;
          } else {
            console.log("modality "+ modality + " is already activated");
          }
        });
      }
    }
  },
  disableAllModalitiesExcept: function(except) {
    for (var i in modalities) {
      var modality = modalities[i];
      var selector = ".btn-bar > ." + modality;
      var client = this;

      if(except !== modality) {
        this.exists(selector, function(selector, found) {
          if(found) {
            console.log("Clicking "+selector);
            client.click(selector);
          }
        });
      }
    }
  },
  exists: function(selector, callback) {
    this.api.elements("css selector", selector, function(result) {
      if(result.value && result.value.length > 0 && result.value[0].ELEMENT) {
        callback(selector, true);
      } else {
        callback(selector, false);
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

'use strict'

var commands = {
  zoomIn: function(times) {
    this.waitForElementVisible("@zoomIn", this.api.globals.itinerarySearchTimeout);
    for (var i = 0; i < times; i++) {
      this.click("@zoomIn");
    }
  }
}
module.exports = {
  commands: [commands],
  elements: {
    zoomIn: {
      selector: ".leaflet-control-zoom-in"
    }
  }
}

'use strict'

var commands = {
  clickAnyMarker: function() {
    return this.click("@anyStopMarker");
  },
  waitForDepartureVisible: function() {
    return this.waitForElementVisible("@departure", this.api.globals.itinerarySearchTimeout);
  }
}

module.exports = {
  commands: [commands],
  elements: {
    departure: {
      selector: ".departure .route-detail-text"
    }
  }
}

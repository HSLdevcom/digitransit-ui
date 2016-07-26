function expectCardHeader(expected) {
  this.waitForElementVisible('@cardHeader',
                             this.api.globals.itinerarySearchTimeout);
  return this.assert.containsText('@cardHeader', expected);
}

function waitForDepartureVisible() {
  return this.waitForElementVisible('@departure',
                                    this.api.globals.itinerarySearchTimeout);
}

module.exports = {
  commands: [{
    expectCardHeader,
    waitForDepartureVisible,
  }],
  elements: {
    cluster: {
      selector: '.leaflet-popup-content .card',
    },
    clusterStop: {
      selector: '.card .cursor-pointer',
    },
    cardHeader: {
      selector: '.card-header .sub-header-h4',
    },
    departure: {
      selector: '.route-detail-text',
    },
  },
};

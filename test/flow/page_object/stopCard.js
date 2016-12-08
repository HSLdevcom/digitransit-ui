function expectCardHeaderDescription(expected) {
  this.waitForElementVisible('@cardHeader', this.api.globals.itinerarySearchTimeout);
  return this.assert.containsText('@cardHeader', expected);
}

function waitForDepartureVisible() {
  return this.waitForElementVisible('@departure', this.api.globals.itinerarySearchTimeout);
}

function navigateToStopPage() {
  return this.api.checkedClick(this.elements.cardName.selector)
  .waitForElementVisible('div.card-header.stop-page.header',
      this.api.globals.itinerarySearchTimeout);
}

module.exports = {
  commands: [{
    expectCardHeaderDescription,
    waitForDepartureVisible,
    navigateToStopPage,
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
    cardName: {
      selector: '.card-header > .card-header-wrapper > .h3',
    },
    departure: {
      selector: '.route-detail-text',
    },
  },
};

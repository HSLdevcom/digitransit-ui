function clickAnyMarker() {
  return this.click('@anyStopMarker');
}

function waitForDepartureVisible() {
  return this.waitForElementVisible('@departure',
                                    this.api.globals.itinerarySearchTimeout);
}

function expectCardHeader(expected) {
  this.waitForElementVisible('@cardHeader',
                             this.api.globals.itinerarySearchTimeout);
  return this.assert.containsText('@cardHeader', expected);
}

module.exports = {
  commands: [{
    clickAnyMarker,
    waitForDepartureVisible,
    expectCardHeader,
  }],
  elements: {
    departure: {
      selector: '.departure .route-detail-text',
    },
    cardHeader: {
      selector: '.card-header > span.h3',
    },
  },
};

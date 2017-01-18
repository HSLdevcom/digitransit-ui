function waitClose() {
  return this.waitForElementNotPresent('@destination',
                                       this.api.globals.elementVisibleTimeout);
}

function waitForFirstItineraryRow() {
  return this.waitForElementVisible('@firstItinerarySummaryRow',
                          this.api.globals.itinerarySearchTimeout);
}

function waitForItineraryRowOfType(modality) {
  return this.waitForElementVisible(`.line .${modality}:nth-of-type(1)`,
                                    this.api.globals.itinerarySearchTimeout);
}

function waitForItineraryRowOfTypeNotPresent(modality) {
  return this.waitForElementNotPresent(`.line .${modality}:nth-of-type(1)`,
                                       this.api.globals.itinerarySearchTimeout);
}

function chooseFirstItinerarySuggestion() {
  return this.api.checkedClick(this.elements.firstItinerarySummaryRow.selector);
}

function chooseSecondItinerarySuggestion() {
  return this.api.checkedClick(this.elements.firstItinerarySummaryRow.selector);
}

function clickSwapOriginDestination() {
  this.waitForElementVisible('@swapDir', this.api.globals.elementVisibleTimeout);
  return this.api.checkedClick(this.elements.swapDir.selector);
}

function clickLater() {
  this.waitForElementVisible('@later', this.api.globals.elementVisibleTimeout);
  return this.api.checkedClick(this.elements.later.selector);
}

function clickChangeDestination() {
  this.waitForElementVisible('@destination', this.api.globals.elementVisibleTimeout);
  return this.api.checkedClick(this.elements.destination.selector);
}

function waitForSearchModal() {
  return this.waitForElementVisible(
    '.onetab-search-modal-container',
    this.api.globals.elementVisibleTimeout);
}

module.exports = {
  commands: [{
    waitForFirstItineraryRow,
    waitForItineraryRowOfType,
    waitForItineraryRowOfTypeNotPresent,
    chooseFirstItinerarySuggestion,
    chooseSecondItinerarySuggestion,
    clickSwapOriginDestination,
    clickLater,
    clickChangeDestination,
    waitClose,
    waitForSearchModal,
  }],
  elements: {
    firstItinerarySummaryRow: '.itinerary-summary-row:nth-of-type(1)',
    secondItinerarySummaryRow: '.itinerary-summary-row:nth-of-type(2)',
    swapDir: '.switch',
    later: '.time-navigation-later-btn',
    destination: '#open-destination',
  },
};

function waitClose() {
  return this.waitForElementNotPresent(
    '@destination',
    this.api.globals.elementVisibleTimeout,
  );
}

function waitForFirstItineraryRow() {
  return this.waitForElementVisible(
    '@firstItinerarySummaryRow',
    this.api.globals.itinerarySearchTimeout,
  );
}

function waitForItineraryRowOfType(modality, timeoutInSeconds = 0) {
  const timeout =
    timeoutInSeconds > 0
      ? timeoutInSeconds * 1000
      : this.api.globals.itinerarySearchTimeout;
  return this.waitForElementVisible(
    `.line .${modality}:nth-of-type(1)`,
    timeout,
  );
}

function waitForItineraryRowOfTypeNotPresent(modality) {
  return this.waitForElementNotPresent(
    `.line .${modality}:nth-of-type(1)`,
    this.api.globals.itinerarySearchTimeout,
  );
}

function chooseFirstItinerarySuggestion() {
  return this.api.checkedClick(this.elements.firstItinerarySummaryRow.selector);
}

function chooseSecondItinerarySuggestion() {
  return this.api.checkedClick(this.elements.firstItinerarySummaryRow.selector);
}

function clickSwapOriginDestination() {
  this.waitForElementVisible(
    '@swapDir',
    this.api.globals.elementVisibleTimeout,
  );
  return this.api.checkedClick(this.elements.swapDir.selector);
}

function clickNow() {
  this.waitForElementVisible('@now', this.api.globals.elementVisibleTimeout);
  return this.api.checkedClick(this.elements.now.selector);
}

function clickLater() {
  this.waitForElementVisible('@later', this.api.globals.elementVisibleTimeout);
  return this.api.checkedClick(this.elements.later.selector);
}

function clickEarlier() {
  this.waitForElementVisible(
    '@earlier',
    this.api.globals.elementVisibleTimeout,
  );
  return this.api.checkedClick(this.elements.earlier.selector);
}

function clickChangeDestination() {
  this.waitForElementVisible(
    '@destination',
    this.api.globals.elementVisibleTimeout,
  );
  return this.api.checkedClick(this.elements.destination.selector);
}

function waitForSearchModal() {
  return this.waitForElementVisible(
    '.onetab-search-modal-container',
    this.api.globals.elementVisibleTimeout,
  );
}

module.exports = {
  commands: [
    {
      waitForFirstItineraryRow,
      waitForItineraryRowOfType,
      waitForItineraryRowOfTypeNotPresent,
      chooseFirstItinerarySuggestion,
      chooseSecondItinerarySuggestion,
      clickSwapOriginDestination,
      clickLater,
      clickEarlier,
      clickNow,
      clickChangeDestination,
      waitClose,
      waitForSearchModal,
    },
  ],
  elements: {
    firstItinerarySummaryRow: '.itinerary-summary-row:nth-of-type(1)',
    secondItinerarySummaryRow: '.itinerary-summary-row:nth-of-type(2)',
    swapDir: '.switch',
    later: '.time-navigation-later-btn',
    earlier: '.time-navigation-earlier-btn',
    now: '.time-navigation-now-btn',
    destination: '#open-destination',
  },
};

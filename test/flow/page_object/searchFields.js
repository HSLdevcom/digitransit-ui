function setOrigin(origin) {
  this.waitForElementNotPresent(
    '@spinner',
    this.api.globals.elementVisibleTimeout,
  );
  this.waitForElementVisible(
    '@clearOrigin',
    this.api.globals.elementVisibleTimeout,
  );
  this.api.pause(this.api.globals.pause_ms);
  this.checkedClick(this.elements.clearOrigin.selector);
  this.api.pause(this.api.globals.pause_ms);
  this.setValue('@searchOrigin', origin);
  this.api.pause(this.api.globals.pause_ms);
  this.verifyItemInSearchResult(origin);
  return this;
}

function selectOrigin(origin) {
  this.setOrigin(origin);
  this.checkedClick(this.elements.firstSuggestedOriginItem.selector);
  return this;
}

function setDestination(destination) {
  this.api.debug('setting destination');
  this.waitForElementPresent(
    '@searchDestination',
    this.api.globals.elementVisibleTimeout,
  );
  this.clearValue('@searchDestination');
  this.setValue('@searchDestination', destination);
  this.api.pause(this.api.globals.pause_ms);
  this.verifyItemInSearchResult(destination);
  return this;
}

function selectDestination(destination) {
  this.setDestination(destination);
  this.checkedClick(this.elements.firstSuggestedDestinationItem.selector);
  return this;
}

function useCurrentLocationInOrigin() {
  const timeout = this.api.globals.elementVisibleTimeout;
  this.api.debug('Selecting origin');
  this.clearValue('@searchOrigin').waitForElementVisible(
    '@searchResultCurrentLocation',
    timeout,
  );
  this.api.checkedClick(this.elements.searchResultCurrentLocation.selector);
  return this;
}

function itinerarySearch(origin, destination) {
  this.selectOrigin(origin);
  this.selectDestination(destination);
  return this;
}

function selectFirstRouteSuggestion(route) {
  const timeout = this.api.globals.elementVisibleTimeout;
  this.setOrigin(route);
  this.waitForElementVisible(
    this.elements.firstRouteSuggestion.selector,
    timeout,
  );
  this.checkedClick(this.elements.firstRouteSuggestion.selector);
  return this;
}

function selectTimetableForFirstResult(search) {
  const timeout = this.api.globals.elementVisibleTimeout;
  this.setOrigin(search);
  this.waitForElementVisible(
    this.elements.firstSuggestedItemTimeTable.selector,
    timeout,
  );
  this.checkedClick(this.elements.firstSuggestedItemTimeTable.selector);
  return this;
}

function verifyItemInSearchResult(name) {
  this.api.withXpath(() => {
    this.waitForElementPresent(
      `//*/p[@class='suggestion-name' and contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), '${name
        .split(',')[0]
        .toLowerCase()}')]`,
      this.api.globals.elementVisibleTimeout,
    );
  });
  return this;
}

module.exports = {
  commands: [
    {
      setOrigin,
      setDestination,
      selectOrigin,
      selectDestination,
      useCurrentLocationInOrigin,
      itinerarySearch,
      selectTimetableForFirstResult,
      verifyItemInSearchResult,
      selectFirstRouteSuggestion,
    },
  ],
  elements: {
    searchOrigin: {
      selector: '#origin',
    },
    searchDestination: {
      selector: '#destination',
    },
    clearOrigin: {
      selector: '.clear-input',
    },
    firstSuggestedOriginItem: {
      selector: '#react-autowhatever-origin--item-0',
    },
    firstSuggestedDestinationItem: {
      selector: '#react-autowhatever-destination--item-0',
    },
    firstRouteSuggestion: {
      selector: '.search-result.Route',
    },
    firstSuggestedItemTimeTable: {
      selector:
        '#react-autowhatever-origin--item-0 .suggestion-item-timetable-label',
    },
    searchResultCurrentLocation: {
      selector: '.search-result.CurrentLocation',
    },
    geolocationSelected: {
      selector: '.search-current-origin-tip svg.icon',
    },
    spinner: {
      selector: '.overlay-with-spinner',
    },
  },
};

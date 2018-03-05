function setOrigin(origin) {
  this.setValue('@searchOrigin', ' ');
  this.api.pause(this.api.globals.pause_ms);
  this.clearValue('@searchOrigin');
  this.setValue('@searchOrigin', origin);
  this.api.pause(this.api.globals.pause_ms);
  this.verifyItemInSearchResult(origin);
  return this;
}

function useCurrentLocationInOrigin() {
  const timeout = this.api.globals.elementVisibleTimeout;
  this.api.checkedClick(this.elements.origin.selector);
  this.waitForElementVisible('@searchOrigin', timeout);
  this.isVisible('@geolocationSelected', result => {
    if (result && result.value) {
      this.api.debug('Origin already selected');
      this.waitForElementVisible('@closeSearchButton', timeout);
      this.api.checkedClick(this.elements.closeSearchButton.selector);
      return this;
    }
    this.api.debug('Selecting origin');
    this.clearValue('@searchOrigin').waitForElementVisible(
      '@searchResultCurrentLocation',
      timeout,
    );
    this.api.checkedClick(this.elements.searchResultCurrentLocation.selector);
    return this;
  });
  return this;
}

function enterKeyOrigin() {
  this.api.debug('hit enter origin');
  this.waitForElementPresent(
    'li#react-autowhatever-origin--item-0',
    this.api.globals.elementVisibleTimeout,
  );
  return this.setValue('@searchOrigin', this.api.Keys.ENTER);
}

function waitSearchClosing() {
  this.waitForElementNotPresent(
    '@origin',
    this.api.globals.elementVisibleTimeout,
  );
}

function setDestination(destination) {
  this.api.debug('setting destination');
  this.waitForElementPresent(
    '@searchDestination',
    this.api.globals.elementVisibleTimeout,
  );
  this.setValue('@searchDestination', ' ');
  this.api.pause(1500);
  this.clearValue('@searchDestination');
  this.setValue('@searchDestination', destination);
  this.verifyItemInSearchResult(destination);
  return this;
}

function enterKeyDestination() {
  this.api.debug('hit enter destination');
  this.waitForElementPresent(
    'li#react-autowhatever-destination--item-0',
    this.api.globals.elementVisibleTimeout,
  );

  return this.setValue('@searchDestination', this.api.Keys.ENTER);
}

function enterKeySearch() {
  this.api.debug('click on first route suggestion');
  this.waitForElementPresent(
    'li#react-autowhatever-destination--item-0',
    this.api.globals.elementVisibleTimeout,
  );
  return this.checkedClick(
    '.react-autowhatever__items-list .search-result.Route',
  );
}

function itinerarySearch(origin, destination) {
  this.setOrigin(origin);
  this.enterKeyOrigin();
  this.setDestination(destination);
  this.enterKeyDestination();
  return this;
}

function setSearch(search) {
  const timeout = this.api.globals.elementVisibleTimeout;
  this.waitForElementVisible('@searchDestination', timeout);
  this.setValue('@searchDestination', search);
  this.waitForElementVisible('@firstSuggestedDestinationItem', timeout);
  return this.enterKeySearch();
}

function selectFirstRouteSuggestion(search) {
  const timeout = this.api.globals.elementVisibleTimeout;
  this.setOrigin(search);
  this.waitForElementVisible(
    this.elements.firstRouteSuggestion.selector,
    timeout,
  );
  this.checkedClick(this.elements.firstRouteSuggestion.selector);
}

function selectTimetableForFirstResult(search) {
  const timeout = this.api.globals.elementVisibleTimeout;
  this.setOrigin(search);
  this.waitForElementVisible(
    this.elements.firstSuggestedItemTimeTable.selector,
    timeout,
  );
  this.checkedClick(this.elements.firstSuggestedItemTimeTable.selector);
}

function verifyItemInSearchResult(favouriteName) {
  this.api.withXpath(() => {
    this.waitForElementPresent(
      `//*/p[@class='suggestion-name' and contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), '${favouriteName
        .split(',')[0]
        .toLowerCase()}')]`,
      this.api.globals.elementVisibleTimeout,
    );
  });
}

module.exports = {
  commands: [
    {
      enterKeySearch,
      setOrigin,
      useCurrentLocationInOrigin,
      enterKeyOrigin,
      setDestination,
      enterKeyDestination,
      itinerarySearch,
      setSearch,
      selectTimetableForFirstResult,
      waitSearchClosing,
      verifyItemInSearchResult,
      selectFirstRouteSuggestion,
    },
  ],
  elements: {
    frontPageSearchBar: {
      selector: '#front-page-search-bar',
    },
    origin: {
      selector: '#origin',
    },
    searchOrigin: {
      selector: '#origin',
    },
    destination: {
      selector: '#destination',
    },
    searchDestination: {
      selector: '#destination',
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
    search: {
      selector: 'a#search-tab',
    },
    searchResultCurrentLocation: {
      selector: '.search-result.CurrentLocation',
    },
    geolocationSelected: {
      selector: '.search-current-origin-tip svg.icon',
    },
    closeSearchButton: {
      selector: '#close-search-button-container > button',
    },
  },
};

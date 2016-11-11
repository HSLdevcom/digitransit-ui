function setOrigin(origin) {
  const timeout = this.api.globals.elementVisibleTimeout;
  this.openSearch();
  this.waitForElementVisible('@origin', timeout);
  this.api.checkedClick(this.elements.origin.selector);
  this.waitForElementVisible('@searchOrigin', timeout);
  this.clearValue('@searchOrigin');
  this.setValue('@searchOrigin', origin);

  if (origin.length > 0) {
    this.waitForElementNotPresent('@searchResultCurrentLocation', timeout);
  }
  return this;
}

function useCurrentLocationInOrigin() {
  const timeout = this.api.globals.elementVisibleTimeout;
  this.openSearch();
  this.waitForElementVisible('@origin', timeout);
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
    this.clearValue('@searchOrigin')
      .waitForElementVisible('@searchResultCurrentLocation', timeout);
    this.api.checkedClick(this.elements.searchResultCurrentLocation.selector);
    return this;
  });
  return this;
}

function enterKeyOrigin() {
  this.api.debug('hit enter origin');
  this.waitForElementPresent('li#react-autowhatever-suggest--item-0',
    this.api.globals.elementVisibleTimeout);
  return this.setValue('@searchOrigin', this.api.Keys.ENTER);
}

function openSearch() {
  this.waitForElementVisible('@frontPageSearchBar', this.api.globals.elementVisibleTimeout);
  this.api.checkedClick(this.elements.frontPageSearchBar.selector);
}

function setDestination(destination) {
  this.api.debug('setting destination');
  this.openSearch();
  this.waitForElementVisible('@destination', this.api.globals.elementVisibleTimeout);
  this.checkedClick(this.elements.destination.selector);
  this.waitForElementVisible('@searchDestination', this.api.globals.elementVisibleTimeout);
  this.setValue('@searchDestination', destination);
  if (destination.length > 0) {
    this.waitForElementNotPresent('@searchResultCurrentLocation',
    this.api.globals.elementVisibleTimeout);
  }
  return this;
}

function enterKeyDestination() {
  this.api.debug('hit enter destination');
  this.waitForElementPresent('li#react-autowhatever-suggest--item-0',
    this.api.globals.elementVisibleTimeout);

  return this.setValue('@searchDestination', this.api.Keys.ENTER);
}

function enterKeySearch() {
  this.api.debug('hit enter search');
  this.waitForElementPresent('li#react-autowhatever-suggest--item-0',
    this.api.globals.elementVisibleTimeout);
  return this.setValue('@searchDestination', this.api.Keys.ENTER);
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
  this.openSearch();
  this.waitForElementVisible('@search', timeout);
  this.api.checkedClick(this.elements.search.selector);
  this.waitForElementVisible('@searchDestination', timeout)
  .setValue('@searchDestination', search);
  this.waitForElementVisible('@firstSuggestedItem', timeout);

  return this.enterKeySearch();
}

module.exports = {
  commands: [{
    enterKeySearch,
    setOrigin,
    useCurrentLocationInOrigin,
    enterKeyOrigin,
    setDestination,
    enterKeyDestination,
    itinerarySearch,
    setSearch,
    openSearch,
  }],
  elements: {
    frontPageSearchBar: {
      selector: '#front-page-search-bar',
    },
    origin: {
      selector: '#origin',
    },
    searchOrigin: {
      selector: '#search-origin',
    },
    destination: {
      selector: '#destination',
    },
    searchDestination: {
      selector: '#search-destination',
    },
    firstSuggestedItem: {
      selector: '#react-autowhatever-suggest--item-0',
    },
    search: {
      selector: 'a#search-tab',
    },
    searchResultCurrentLocation: {
      selector: '.search-result.CurrentLocation',
    },
    geolocationSelected: {
      selector: '.geolocation-selected',
    },
    closeSearchButton: {
      selector: '#closeSearchButton',
    },
  },
};

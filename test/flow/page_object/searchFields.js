function setOrigin(origin) {
  const timeout = this.api.globals.elementVisibleTimeout;
  this.waitForElementVisible('@frontPageSearchBar', timeout)
    .click('@frontPageSearchBar')
    .waitForElementVisible('@origin', timeout)
    .click('@origin')
    .waitForElementVisible('@searchOrigin', timeout)
    .clearValue('@searchOrigin')
    .setValue('@searchOrigin', origin);

  return this;
}

function useCurrentLocationInOrigin() {
  const timeout = this.api.globals.elementVisibleTimeout;
  this.waitForElementVisible('@frontPageSearchBar', timeout)
    .click('@frontPageSearchBar')
    .waitForElementVisible('@origin', timeout)
    .click('@origin');
  this.waitForElementVisible('@searchOrigin', timeout)
    .clearValue('@searchOrigin')
    .waitForElementVisible('@searchResultCurrentLocation', timeout)
    .click('@searchResultCurrentLocation');

  return this;
}

function enterKeyOrigin() {
  this.api.pause(2000);
  return this.setValue('@searchOrigin', this.api.Keys.ENTER);
}

function setDestination(destination) {
  const timeout = this.api.globals.elementVisibleTimeout;
  return this.waitForElementVisible('@frontPageSearchBar', timeout)
    .click('@frontPageSearchBar')
    .waitForElementVisible('@destination', timeout)
    .click('@destination')
    .waitForElementVisible('@searchDestination', timeout)
    .setValue('@searchDestination', destination);
}

function enterKeyDestination() {
  this.api.pause(2000);
  return this.setValue('@searchDestination', this.api.Keys.ENTER);
}

function itinerarySearch(origin, destination) {
  return this.setOrigin(origin)
    .enterKeyOrigin()
    .setDestination(destination)
    .enterKeyDestination();
}

function setSearch(search) {
  const timeout = this.api.globals.elementVisibleTimeout;
  this.waitForElementVisible('@frontPageSearchBar', timeout)
    .click('@frontPageSearchBar')
    .waitForElementVisible('@search', timeout)
    .click('@search')
    .waitForElementVisible('@searchInput', timeout)
    .setValue('@searchInput', search);

  this.api.pause(1000);
  return this.setValue('@searchInput', this.api.Keys.ENTER);
}

module.exports = {
  commands: [{
    setOrigin,
    useCurrentLocationInOrigin,
    enterKeyOrigin,
    setDestination,
    enterKeyDestination,
    itinerarySearch,
    setSearch,
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
      selector: 'button#search-button',
    },
    searchInput: {
      selector: '#search',
    },
    searchResultCurrentLocation: {
      selector: '.search-result.CurrentLocation',
    },
  },
};

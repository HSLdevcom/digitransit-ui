function setOrigin(origin) {
  const timeout = this.api.globals.elementVisibleTimeout;
  this.waitForElementVisible('@frontPageSearchBar', timeout)
    .click('@frontPageSearchBar', result => {
      this.assert.equal(result.status, 0);
    })
    .waitForElementVisible('@origin', timeout)
    .click('@origin', result => {
      this.assert.equal(result.status, 0);
    })
    .waitForElementVisible('@searchOrigin', timeout)
    .clearValue('@searchOrigin');
  this.api.pause(50);
  return this.setValue('@searchOrigin', origin);
}

function useCurrentLocationInOrigin() {
  const timeout = this.api.globals.elementVisibleTimeout;
  return this.waitForElementVisible('@frontPageSearchBar', timeout)
    .click('@frontPageSearchBar', result => {
      this.assert.equal(result.status, 0);
    })
    .waitForElementVisible('@origin', timeout)
    .click('@origin', result => {
      this.assert.equal(result.status, 0);
    })
    .waitForElementVisible('@searchOrigin', timeout)
    .clearValue('@searchOrigin')
    .waitForElementVisible('@searchResultCurrentLocation', timeout)
    .click('@searchResultCurrentLocation', result => {
      this.assert.equal(result.status, 0);
    });
}

function enterKeyOrigin() {
  this.api.debug('hit enter origin');
  this.waitForElementPresent('li#react-autowhatever-suggest--item-0',
    this.api.globals.elementVisibleTimeout);
  return this.setValue('@searchOrigin', this.api.Keys.ENTER);
}

function setDestination(destination) {
  this.api.debug('setting destination');
  return this.waitForElementVisible('@frontPageSearchBar', this.api.globals.elementVisibleTimeout)
    .click('@frontPageSearchBar', result => {
      this.assert.equal(result.status, 0);
    })
    .waitForElementVisible('@destination', this.api.globals.elementVisibleTimeout)
    .click('@destination', result => {
      this.assert.equal(result.status, 0);
    })
    .waitForElementVisible('@searchDestination', this.api.globals.elementVisibleTimeout)
    .setValue('@searchDestination', destination);
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
  return this.setValue('@searchInput', this.api.Keys.ENTER);
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
    .click('@frontPageSearchBar', result => {
      this.assert.equal(result.status, 0);
    })
    .waitForElementVisible('@search', timeout)
    .click('@search', result => {
      this.assert.equal(result.status, 0);
    })
    .waitForElementVisible('@searchInput', timeout)
    .setValue('@searchInput', search);

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

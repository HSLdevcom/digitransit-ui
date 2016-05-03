'use strict'

var searchCommands = {
  setOrigin: function(origin) {
    var timeout = this.api.globals.elementVisibleTimeout;
    return this.waitForElementVisible('@frontPageSearchBar', timeout)
      .click('@frontPageSearchBar')
      .waitForElementVisible('@origin', timeout)
      .click('@origin')
      .waitForElementVisible('@searchOrigin', timeout)
      .setValue('@searchOrigin', origin);
  },
  setDestination: function(destination) {
    var timeout = this.api.globals.elementVisibleTimeout;
    return this.waitForElementVisible('@frontPageSearchBar', timeout)
      .click('@frontPageSearchBar')
      .waitForElementVisible('@destination', timeout)
      .click('@destination')
      .waitForElementVisible('@searchDestination', timeout)
      .setValue('@searchDestination', destination);
  },
  itinerarySearch: function(origin, destination) {
    this.setOrigin(origin);
    this.api.pause(1000);
    this.waitForElementVisible('@firstSuggestedItem', timeout)
        .setValue('@searchOrigin', this.api.Keys.ENTER);

    this.setDestination(destination);
    this.api.pause(1000);
    return this.setValue('@searchDestination', this.api.Keys.ENTER);
  },
  setSearch: function(search) {
    var timeout = this.api.globals.elementVisibleTimeout;
    this.waitForElementVisible('@frontPageSearchBar', timeout)
      .click('@frontPageSearchBar')
      .waitForElementVisible('@search', timeout)
      .click('@search')
      .waitForElementVisible('@searchInput', timeout)
      .setValue('@searchInput', search);

    this.api.pause(1000);
    return this.setValue('@searchInput', this.api.Keys.ENTER);
  }
};

module.exports = {
  commands: [searchCommands],
  elements: {
    frontPageSearchBar: {
      selector: '#front-page-search-bar'
    },
    origin: {
      selector: '#origin'
    },
    searchOrigin: {
      selector: '#search-origin'
    },
    destination: {
      selector: '#destination'
    },
    searchDestination: {
      selector: '#search-destination'
    },
    firstSuggestedItem: {
      selector: "#react-autowhatever-suggest--item-0"
    },
    search: {
      selector: "[tabindex=\"2\"]"
    },
    searchInput: {
      selector: "#search"
    }
  }
};

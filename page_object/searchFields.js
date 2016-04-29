'use strict'

var searchCommands = {
  setOrigin: function(origin) {
    var timeout = this.api.globals.elementVisibleTimeout;
    this.waitForElementVisible('@frontPageSearchBar', timeout)
      .click('@frontPageSearchBar')
      .waitForElementVisible('@origin', timeout)
      .click('@origin')
      .waitForElementVisible('@searchOrigin', timeout)
      .setValue('@searchOrigin', origin);

    this.api.pause(1000);
    return this.waitForElementVisible('@firstSuggestedItem', timeout)
      .setValue('@searchOrigin', this.api.Keys.ENTER);
  },
  setDestination: function(destination) {
    var timeout = this.api.globals.elementVisibleTimeout;
    this.waitForElementVisible('@frontPageSearchBar', timeout)
      .click('@frontPageSearchBar')
      .waitForElementVisible('@destination', timeout)
      .click('@destination')
      .waitForElementVisible('@searchDestination', timeout)
      .setValue('@searchDestination', destination);

    this.api.pause(1000);
    return this.setValue('@searchDestination', this.api.Keys.ENTER);
  },
  itinerarySearch: function(origin, destination) {
    this.setOrigin(origin);
    this.setDestination(destination);
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
    }
  }
};

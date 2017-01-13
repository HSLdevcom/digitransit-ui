
function clickFavourites() {
  this.api.debug('opening favourites tab');
  this.waitForElementVisible('@favouritePaneSelect', this.api.globals.elementVisibleTimeout);
  this.api.checkedClick(this.elements.favouritePaneSelect.selector);
  return this;
}

function addFavourite() {
  this.api.debug('clicking add favourite');
  this.waitForElementVisible('@newFavouriteButtonContent', this.api.globals.elementVisibleTimeout);
  this.api.checkedClick(this.elements.newFavouriteButtonContent.selector);
  this.waitForElementVisible('@addressPlaceholderNoSelect', this.api.globals.elementVisibleTimeout);
  return this;
}

function openFavouriteSearch() {
  this.api.debug('opening favourite search modal');
  this.api.checkedClick(this.elements.addressPlaceholderNoSelect.selector);
  this.waitForElementPresent('@searchFavourite', this.api.globals.elementVisibleTimeout);
  return this;
}

function waitForFavouriteSearchClosing() {
  this.api.debug('wait favourite search modal closing');
  this.waitForElementNotPresent('@searchFavourite', this.api.globals.elementVisibleTimeout);
  return this;
}


function enterAddress(addressSearch) {
  this.api.debug('entering address');
  this.openFavouriteSearch();
  this.setValue('@searchFavourite', addressSearch);
  this.verifyFavouriteInSearchResult(addressSearch);
  this.setValue('@searchFavourite', this.api.Keys.ENTER);
  return this;
}

function verifyCurrentLocation() {
  this.api.debug('see if current location is available');
  this.api.checkedClick(this.elements.addressPlaceholderNoSelect.selector);
  this.waitForElementPresent('@searchResultCurrentLocation', this.api.globals.elementVisibleTimeout);
  this.setValue('@searchFavourite', this.api.Keys.ENTER);
  return this;
}

function enterName(name) {
  this.api.debug('entering name');
  this.waitForElementVisible('@nameInput', this.api.globals.elementVisibleTimeout);
  return this.setValue('@nameInput', name);
}

function clickHomeIcon() {
  this.api.debug('clicking home icon');
  this.waitForElementVisible('@homeIcon', this.api.globals.elementVisibleTimeout);
  this.api.checkedClick(this.elements.homeIcon.selector);
  return this;
}

function saveFavourite() {
  this.api.debug('saving favourite');
  this.waitForElementVisible('@saveButton', this.api.globals.elementVisibleTimeout);
  this.api.checkedClick(this.elements.saveButton.selector);
  return this;
}

function saveHomeFavourite(address, name) {
  return this.clickFavourites()
    .addFavourite()
    .enterAddress(address)
    .enterName(name)
    .clickHomeIcon()
    .saveFavourite();
}

function verifyFirstName(header) {
  this.waitForElementVisible('@favouriteLocationName', this.api.globals.elementVisibleTimeout);
  return this.assert.containsText('@favouriteLocationName', header);
}

function verifyFavouriteRoute(number) {
  this.waitForElementVisible('@favouriteRoute', this.api.globals.elementVisibleTimeout);
  return this.assert.containsText('@favouriteRoute', number);
}

function verifyFavouriteInSearchResult(favouriteName) {
  this.api.withXpath(() => {
    this.waitForElementPresent(
    `//*/p[@class='suggestion-name' and contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), '${favouriteName.split(',')[0].toLowerCase()}')]`,
      this.api.globals.elementVisibleTimeout);
  });
}

module.exports = {
  commands: [{
    clickFavourites,
    addFavourite,
    enterAddress,
    enterName,
    clickHomeIcon,
    saveFavourite,
    saveHomeFavourite,
    verifyFirstName,
    verifyCurrentLocation,
    verifyFavouriteInSearchResult,
    verifyFavouriteRoute,
    openFavouriteSearch,
    waitForFavouriteSearchClosing,
  }],
  elements: {
    favouritePaneSelect: {
      selector: 'li.favourites',
    },
    newFavouriteButtonContent: {
      selector: '#add-new-favourite-1',
    },
    addressPlaceholderNoSelect: {
      selector: '.address-placeholder ',
    },
    searchFavourite: {
      selector: 'input[type=\'text\']',
    },
    nameInput: {
      selector: '.add-favourite-container__give-name input',
    },
    homeIcon: {
      selector: '.favourite-icon-table-column:nth-of-type(2)',
    },
    saveButton: {
      selector: '.add-favourite-container-button',
    },
    favouriteLocationName: {
      selector: '.favourite-location-name',
    },
    favouriteRoute: {
      selector: '.favourites .vehicle-number',
    },
    searchResultCurrentLocation: {
      selector: '.search-result.CurrentLocation',
    },
  },
};

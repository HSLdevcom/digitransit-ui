function clickFavourites() {
  this.waitForElementVisible('@favouritePaneSelect', this.api.globals.elementVisibleTimeout);
  return this.click('@favouritePaneSelect');
}

function addFavourite() {
  this.waitForElementVisible('@newFavouriteButtonContent', this.api.globals.elementVisibleTimeout);
  return this.click('@newFavouriteButtonContent');
}

function enterAddress(addressSearch) {
  const timeout = this.api.globals.elementVisibleTimeout;
  this.waitForElementVisible('@addressPlaceholderNoSelect', timeout);
  this.click('@addressPlaceholderNoSelect');
  this.waitForElementVisible('@searchFavourite', timeout);
  this.setValue('@searchFavourite', addressSearch);
  this.api.pause(1000);
  return this.setValue('@searchFavourite', this.api.Keys.ENTER);
}

function enterName(name) {
  return this.setValue('@nameInput', name);
}

function clickHomeIcon() {
  return this.click('@homeIcon');
}

function saveFavourite() {
  return this.click('@saveButton');
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

function verifyFavouriteInSearchResult(favouriteName) {
  this.api.useXpath();
  this.waitForElementPresent(
    `//*/li[@class=\'react-autowhatever__item\']/span[text()=\'${favouriteName}\']`,
      this.api.globals.elementVisibleTimeout);
  this.api.useCss();
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
    verifyFavouriteInSearchResult,
  }],
  elements: {
    favouritePaneSelect: {
      selector: '.hover + .favourites',
    },
    newFavouriteButtonContent: {
      selector: '.new-favourite-button-content',
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
  },
};

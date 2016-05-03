'use strict'


var commands = {
  openFavouritesPage: function() {
    this.waitForElementVisible("@favouritePaneSelect", this.api.globals.elementVisibleTimeout);
    return this.click("@favouritePaneSelect");
  },
  addFavourite: function() {
    this.waitForElementVisible("@newFavouriteButtonContent", this.api.globals.elementVisibleTimeout);
    return this.click("@newFavouriteButtonContent");
  },
  enterAddress: function(addressSearch) {
    var timeout = this.api.globals.elementVisibleTimeout;
    this.waitForElementVisible("@addressPlaceholdeNoSelect", timeout);
    this.click("@addressPlaceholdeNoSelect");
    this.waitForElementVisible("@searchFavourite", timeout);
    this.setValue("@searchFavourite", addressSearch);
    this.api.pause(1000);
    return this.setValue("@searchFavourite", this.api.Keys.ENTER);
  },
  enterName: function(name) {
    return this.setValue("@nameInput", name);
  },
  clickHomeIcon: function() {
    return this.click("@homeIcon");
  },
  saveFavourite() {
    return this.click("@saveButton");
  },
  saveHomeFavourite: function(address, name) {
    return this.openFavouritesPage()
      .addFavourite()
      .enterAddress(address)
      .enterName(name)
      .clickHomeIcon()
      .saveFavourite();
  },
  verifyFirstHeader: function(header) {
    this.openFavouritesPage();
    this.waitForElementVisible("@favouriteLocationHeader", this.api.globals.elementVisibleTimeout);
    this.assert.containsText("@favouriteLocationHeader", header);
  }
}

module.exports = {
  commands: [commands],
  elements: {
    favouritePaneSelect: {
      selector: ".hover + .favourites"
    },
    newFavouriteButtonContent: {
      selector: ".new-favourite-button-content"
    },
    addressPlaceholdeNoSelect: {
      selector: ".address-placeholder "
    },
    searchFavourite: {
      selector: "#search-favourite"
    },
    nameInput: {
      selector: ".add-favourite-container__give-name input"
    },
    homeIcon: {
      selector: ".favourite-icon-table-column:nth-of-type(2)"
    },
    saveButton: {
      selector: ".add-favourite-container__save-button"
    },
    favouriteLocationHeader: {
      selector: ".favourite-location-header"
    }
  }
}

function clickSouthOfCurrentLocation() {
  this.api.pause(500);
  this.api.element('class name', 'current-location-marker', (result) => {
    this.api.moveTo(result.value.ELEMENT, 0, 50);
  });
  this.api.pause(100);
  this.api.mouseButtonClick();
  this.api.pause(5000);
}

function waitForPopupPaneVisible() {
  return this.waitForElementVisible('@popupPane',
                                    this.api.globals.itinerarySearchTimeout);
}

module.exports = {
  commands: [{
    clickSouthOfCurrentLocation,
    waitForPopupPaneVisible,
  }],
  elements: {
    currentLocationMarker: {
      selector: '.current-location-marker',
    },
    popupPane: {
      selector: '.leaflet-pane .leaflet-popup-pane',
    },
  },
};

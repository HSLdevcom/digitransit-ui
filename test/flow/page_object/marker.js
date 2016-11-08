function clickSouthOfCurrentLocation() {
  this.api.element('class name', 'current-location-marker', (result) => {
    this.api.moveTo(result.value.ELEMENT, 20, 70); // 50 px south of current position
    this.api.mouseButtonClick();
  });
}

function waitForPopupPaneHeaderVisible() {
  return this.waitForElementVisible('@popupPaneHeader',
                                    this.api.globals.itinerarySearchTimeout);
}

module.exports = {
  commands: [{
    clickSouthOfCurrentLocation,
    waitForPopupPaneHeaderVisible,
  }],
  elements: {
    currentLocationMarker: {
      selector: '.current-location-marker',
    },
    popupPaneHeader: {
      selector: '.leaflet-pane .leaflet-popup-pane .h4',
    },
  },
};

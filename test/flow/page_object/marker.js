function clickSouthOfCurrentLocation() {
  this.api.element('class name', 'current-location-marker', result => {
    this.api.debug('Clicking on map');
    this.api.moveTo(result.value.ELEMENT, 20, 70); // 50 px south of current position
  });

  this.api.pause(this.api.globals.pause_ms);
  this.api.mouseButtonClick();
}

function clickSouthOfPlaceMarker() {
  this.api.element('class name', 'place', result => {
    this.api.debug('Clicking on map');
    this.api.moveTo(result.value.ELEMENT, 20, 70); // 50 px south of marker
  });

  this.api.pause(this.api.globals.pause_ms);
  this.api.mouseButtonClick();
}

function waitForVectorLayerLoaded() {
  this.waitForElementPresent(
    '.leaflet-layer canvas.leaflet-tile-loaded',
    this.api.globals.elementVisibleTimeout,
  );
  return this.waitForElementNotPresent(
    '.leaflet-layer canvas.leaflet-tile:not(.leaflet-tile-loaded)',
    this.api.globals.elementVisibleTimeout,
  );
}

function waitForPopupPaneHeaderVisible() {
  return this.waitForElementVisible(
    '@popupPaneHeader',
    this.api.globals.itinerarySearchTimeout,
  );
}

module.exports = {
  commands: [
    {
      clickSouthOfCurrentLocation,
      clickSouthOfPlaceMarker,
      waitForPopupPaneHeaderVisible,
      waitForVectorLayerLoaded,
    },
  ],
  elements: {
    currentLocationMarker: {
      selector: '.current-location-marker',
    },
    popupPaneHeader: {
      selector: '.leaflet-pane .leaflet-popup-pane .header-primary',
    },
  },
};

'use strict'

var commands = {
    clickSouthOfCurrentLocation: function() {
        this.api.pause(500);
        this.api.element("class name", "current-location-marker", (result) => {
          this.api.moveTo(result.value.ELEMENT, 0, 50);
        });
        this.api.pause(100);
        this.api.mouseButtonClick();
        this.api.pause(5000);
    },
    waitForPopupPaneVisible: function() {
        return this.waitForElementVisible("@popupPane", this.api.globals.itinerarySearchTimeout);
    }
}

module.exports = {
    commands: [commands],
    elements: {
        currentLocationMarker: {
            selector: ".current-location-marker",
        },
        popupPane: {
            selector: ".leaflet-pane .leaflet-popup-pane"
        }
    }
}

'use strict'

var commands = {
    clickAnyBusStopMarker: function() {
        return this.click("@anyBusStopMarker");
    },
    waitForPopupPaneVisible: function() {
        return this.waitForElementVisible("@popupPane", this.api.globals.itinerarySearchTimeout);
    }
}

module.exports = {
    commands: [commands],
    elements: {
        anyBusStopMarker: {
            selector: ".leaflet-marker-icon + .bus"
        },
        popupPane: {
            selector: ".leaflet-pane .leaflet-popup-pane"
        }
    }
}
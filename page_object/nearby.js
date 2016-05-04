'use strict'

var commands = {
    openNearbyRoutes: function() {
        this.waitForElementVisible("@nearbyRoutesPaneSelect", this.api.globals.elementVisibleTimeout);
        return this.click("@nearbyRoutesPaneSelect");
    },
    waitForRoutes: function() {
        var timeout = this.api.globals.elementVisibleTimeout;
        this.waitForElementVisible("@scrollableRoutes", timeout);
        return this.waitForElementVisible("@routeDestination", timeout);
    }
}

module.exports = {
    commands: [commands],
    elements: {
        nearbyRoutesPaneSelect: {
            selector: ".nearby-routes"
        },
        scrollableRoutes: {
            selector: "#scrollable-routes"
        },
        routeDestination: {
            selector: ".route-destination"
        }
    }
}
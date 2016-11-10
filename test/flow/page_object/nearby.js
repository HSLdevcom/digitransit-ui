function openNearbyRoutes() {
  this.waitForElementVisible('@nearbyRoutesPaneSelect',
                             this.api.globals.elementVisibleTimeout);
  this.api.checkedClick(this.elements.nearbyRoutesPaneSelect.selector);
  return this;
}

function waitForRoutes() {
  const timeout = this.api.globals.elementVisibleTimeout;
  this.waitForElementVisible('@scrollableRoutes', timeout);
  return this.waitForElementVisible('@routeDestination', timeout);
}

module.exports = {
  commands: [{
    openNearbyRoutes,
    waitForRoutes,
  }],
  elements: {
    nearbyRoutesPaneSelect: {
      selector: '.nearby-routes',
    },
    scrollableRoutes: {
      selector: '#scrollable-routes',
    },
    routeDestination: {
      selector: '.route-destination',
    },
  },
};

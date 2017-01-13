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

function chooseRoute(n) {
  return this.api.checkedClick(`.next-departure-row:nth-of-type(${n})`);
}

function clickStops() {
  return this.api.checkedClick('.route-tabs > .tabs-navigation > a:nth-of-type(1)');
}

function clickSchedule() {
  return this.api.checkedClick('.route-tabs > .tabs-navigation > a:nth-of-type(2)');
}

function clickAlerts() {
  return this.api.checkedClick('.route-tabs > .tabs-navigation > a:nth-of-type(3)');
}

module.exports = {
  commands: [{
    openNearbyRoutes,
    waitForRoutes,
    chooseRoute,
    clickStops,
    clickSchedule,
    clickAlerts,
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

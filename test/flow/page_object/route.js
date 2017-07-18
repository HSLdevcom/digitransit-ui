function waitForWalkDistance() {
  return this.waitForElementVisible(
    '@walkDistance',
    this.api.globals.elementVisibleTimeout,
  );
}

function addRouteAsFavourite() {
  this.waitForElementVisible(
    '.favourite-icon',
    this.api.globals.elementVisibleTimeout,
  );
  return this.click('@favouriteIcon');
}

module.exports = {
  commands: [
    {
      waitForWalkDistance,
      addRouteAsFavourite,
    },
  ],
  elements: {
    walkDistance: 'span.walk-distance',
    favouriteIcon: '.favourite-icon',
  },
};

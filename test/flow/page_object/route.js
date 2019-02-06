function waitForStopCode() {
  return this.waitForElementVisible(
    '@stopCode',
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
      waitForStopCode,
      addRouteAsFavourite,
    },
  ],
  elements: {
    stopCode: 'span.itinerary-stop-code',
    favouriteIcon: '.favourite-icon',
  },
};

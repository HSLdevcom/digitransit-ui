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

function clickHome() {
  this.waitForElementVisible(
    this.elements.homeIcon,
    this.api.globals.elementVisibleTimeout,
  );
  return this.click(this.elements.homeIcon);
}

module.exports = {
  commands: [
    {
      waitForStopCode,
      addRouteAsFavourite,
      clickHome,
    },
  ],
  elements: {
    stopCode: 'span.itinerary-stop-code',
    favouriteIcon: '.favourite-icon',
    homeIcon: '.home-icon',
  },
};

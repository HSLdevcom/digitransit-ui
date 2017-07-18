function waitForFirstItineraryInstructionColumn() {
  return this.waitForElementVisible(
    '@itineraryInstructionColumn',
    this.api.globals.itinerarySearchTimeout,
  );
}

function verifyOrigin(origin) {
  return this.waitForElementPresent(
    '@itineraryOrigin',
    this.api.globals.itinerarySearchTimeout,
  )
    .moveToElement('@itineraryOrigin', 0, 0)
    .assert.containsText('@itineraryOrigin', origin);
}

function verifyDestination(destination) {
  return this.waitForElementPresent(
    '@itineraryDestination',
    this.api.globals.itinerarySearchTimeout,
  )
    .moveToElement('@itineraryDestination', 0, 0)
    .assert.containsText('@itineraryDestination', destination);
}

module.exports = {
  commands: [
    {
      waitForFirstItineraryInstructionColumn,
      verifyOrigin,
      verifyDestination,
    },
  ],
  elements: {
    itineraryInstructionColumn: '.itinerary-instruction-column',
    itineraryOrigin: '.itinerary-leg-first-row:nth-of-type(1)',
    itineraryDestination: '.itinerary-leg-first-row:last-of-type',
  },
};

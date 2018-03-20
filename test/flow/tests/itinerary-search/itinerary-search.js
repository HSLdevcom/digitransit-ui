module.exports = {
  '@tags': ['itinerary'],
  'Origin and destination exists in instructions if suggestion is chosen': browser => {
    browser.url(browser.launch_url);

    browser.page
      .searchFields()
      .itinerarySearch('Helsingin rautatieasema', 'Narinkkatori');

    const itinerarySummary = browser.page.itinerarySummary();
    itinerarySummary.waitForFirstItineraryRow();
    itinerarySummary.chooseFirstItinerarySuggestion();

    const itineraryInstructions = browser.page.itineraryInstructions();
    itineraryInstructions.waitForFirstItineraryInstructionColumn();
    // test in 2 parts so that helsingin päärautatieasema matches too
    itineraryInstructions.verifyOrigin('Helsingin');
    itineraryInstructions.verifyOrigin('rautatieasema');

    itineraryInstructions.verifyDestination('Narinkka');
    browser.end();
  },

  'From Kuninkaanportti to Pohjolanaukio': browser => {
    browser.url(browser.launch_url);

    browser.page
      .searchFields()
      .itinerarySearch('kuninkaanportti', 'Pohjolanaukio');

    const itinerarySummary = browser.page.itinerarySummary();
    itinerarySummary.waitForFirstItineraryRow();
    itinerarySummary.chooseFirstItinerarySuggestion();

    const itineraryInstructions = browser.page.itineraryInstructions();
    itineraryInstructions.waitForFirstItineraryInstructionColumn();
    itineraryInstructions.verifyOrigin('Kuninkaanportti');
    itineraryInstructions.verifyDestination('Pohjolanaukio');
    browser.end();
  },
};

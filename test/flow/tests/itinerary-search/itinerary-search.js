module.exports = {
  '@tags': ['itinerary'],
  'Origin and destination exists in instructions if suggestion is chosen': browser => {
    browser.url(browser.launch_url);

    browser.page
      .searchFields()
      .itinerarySearch('helsingin rautatieasema', 'Narinkkatori');

    const itinerarySummary = browser.page.itinerarySummary();
    itinerarySummary.waitForFirstItineraryRow();
    itinerarySummary.chooseFirstItinerarySuggestion();

    const itineraryInstructions = browser.page.itineraryInstructions();
    itineraryInstructions.waitForFirstItineraryInstructionColumn();
    itineraryInstructions.verifyOrigin('Helsingin rautatieasema');
    itineraryInstructions.verifyDestination('Narinkkatori');
    browser.end();
  },

  'From Kuninkaanportti to Pohjolanaukio': browser => {
    browser.url(browser.launch_url);

    browser.page
      .searchFields()
      .itinerarySearch('kuninkaanportti', 'Pohjolanaukio');
    browser.page.itinerarySummary().waitForFirstItineraryRow();

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

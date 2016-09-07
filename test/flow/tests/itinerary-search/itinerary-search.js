module.exports = {
  '@tags': ['itinerary'],
  'Origin and destination exists in instructions if suggestion is chosen': (browser) => {
    browser.url(browser.launch_url);

    browser.page.searchFields().itinerarySearch('Helsinki central railway', 'Narinkkatori');

    const itinerarySummary = browser.page.itinerarySummary();
    itinerarySummary.waitForFirstItineraryRow();
    itinerarySummary.chooseFirstItinerarySuggestion();

    const itineraryInstructions = browser.page.itineraryInstructions();
    itineraryInstructions.waitForFirstItineraryInstructionColumn();
    itineraryInstructions.verifyOrigin('Helsinki Central railway station, Helsinki');
    itineraryInstructions.verifyDestination('Narinkkatori, Helsinki');
    browser.end();
  },

  'From King\'s gate to Pohjolanaukio': (browser) => {
    browser.url(browser.launch_url);
    browser.page.searchFields().itinerarySearch('King\'s gate', 'Pohjolanaukio');
    browser.page.itinerarySummary().waitForFirstItineraryRow();

    const itinerarySummary = browser.page.itinerarySummary();
    itinerarySummary.waitForFirstItineraryRow();
    itinerarySummary.chooseFirstItinerarySuggestion();

    const itineraryInstructions = browser.page.itineraryInstructions();
    itineraryInstructions.waitForFirstItineraryInstructionColumn();
    itineraryInstructions.verifyOrigin('King\'s Gate,');
    itineraryInstructions.verifyDestination('Pohjolanaukio');
    browser.end();
  },
};

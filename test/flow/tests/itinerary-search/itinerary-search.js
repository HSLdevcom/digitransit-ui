module.exports = {
  '@tags': ['itinerary'],
  'Origin and destination exists in instructions if suggestion is chosen': (browser) => {
    browser.url(browser.launch_url);
    const splash = browser.page.splash();
    splash.waitClose();
//    const messagebar = browser.page.messageBar();
//    messagebar.close();

    browser.page.searchFields().itinerarySearch('helsingin rautatieasema', 'Narinkkatori');

    const itinerarySummary = browser.page.itinerarySummary();
    itinerarySummary.waitForFirstItineraryRow();
    itinerarySummary.chooseFirstItinerarySuggestion();

    const itineraryInstructions = browser.page.itineraryInstructions();
    itineraryInstructions.waitForFirstItineraryInstructionColumn();
    itineraryInstructions.verifyOrigin('Helsingin rautatieasema, Helsinki');
    itineraryInstructions.verifyDestination('Narinkkatori, Helsinki');
    browser.end();
  },

  'From Kuninkaanportti to Pohjolanaukio': (browser) => {
    browser.url(browser.launch_url);
    const splash = browser.page.splash();
    splash.waitClose();
//    const messagebar = browser.page.messageBar();
//    messagebar.close();
    browser.page.searchFields().itinerarySearch('kuninkaanportti', 'Pohjolanaukio');
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

  'Custom search options are not forgotten if endpoint changes': (browser) => {
    browser.url(browser.launch_url);
    const splash = browser.page.splash();
    splash.waitClose();

    const searchFields = browser.page.searchFields();
    searchFields.itinerarySearch('Helsingin rautatieasema', 'Opastinsilta 6');

    const itinerarySummary = browser.page.itinerarySummary();
    itinerarySummary.waitForFirstItineraryRow();

    const customizeSearch = browser.page.customizeSearch();
    customizeSearch.clickCanvasToggle();
    customizeSearch.disableModality('rail');

    // rautatieasema  - pasila had rail connections before disable
    itinerarySummary.waitForItineraryRowOfTypeNotPresent('rail');

    itinerarySummary.clickSwapOriginDestination();

    // rail still not available
    itinerarySummary.waitForItineraryRowOfTypeNotPresent('rail');

    browser.end();
  },

};

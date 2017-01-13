module.exports = {
  '@tags': ['back button'],

  'History works on itinerary summary page': (browser) => {
    browser.url(browser.launch_url);

    const searchFields = browser.page.searchFields();
    searchFields.itinerarySearch('Elielinaukio', 'Opastinsilta 6');

    const itinerarySummary = browser.page.itinerarySummary();
    itinerarySummary.waitForFirstItineraryRow();

    const customizeSearch = browser.page.customizeSearch();
    customizeSearch.clickCanvasToggle();

    browser.back();

    //  Itinerary page controls are available because back button closed offcanvas
    itinerarySummary.clickSwapOriginDestination();
    itinerarySummary.clickLater();

    // back button closes search modal
    itinerarySummary.clickChangeDestination(); // change endpoint
    itinerarySummary.waitForSearchModal();
    browser.back(); // close modal

    //  Changing time or endpoints should not accumulate to history, so back takes to index page:
    browser.back();
    itinerarySummary.waitClose();

    browser.end();
  },

  'Itinerary selection changes do not accumulate into history': (browser) => {
    browser.url(browser.launch_url);
    const splash = browser.page.splash();
    splash.waitClose();

    const searchFields = browser.page.searchFields();
    searchFields.itinerarySearch('Elielinaukio', 'Opastinsilta 6');

    const itinerarySummary = browser.page.itinerarySummary();
    itinerarySummary.waitForFirstItineraryRow();
    // do some selections
    itinerarySummary.chooseSecondItinerarySuggestion();
    itinerarySummary.chooseFirstItinerarySuggestion();
    itinerarySummary.chooseFirstItinerarySuggestion(); // 2nd click expands

    browser.back(); // back to summary of all routes
    browser.back(); // to index page

    itinerarySummary.waitClose();

    browser.end();
  },
};

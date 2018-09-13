module.exports = {
  '@tags': ['smoke'],
  OldSearchShouldRedirect: browser => {
    const date = new Date();

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getYear() + 1900;
    const hour = date.getHours() + -3;
    const minute = date.getMinutes();

    const url = `${
      browser.launch_url
    }&from_in=malmin%2bkauppatie&to_in=pasila&when=now&timetype=departure&hour=${hour}&minute=${minute}&daymonthyear=${day}.${month}.${year}&form_build_id=form-wdOvinqH72XqTtDZF0cHQOz8d9o3bU3nrzDbFIv5-Lc&form_id=reittiopas_search_form&day=${day}&month=${month}&year=${year}`;

    browser.url(url);
    const itinerarySummary = browser.page.itinerarySummary();
    itinerarySummary.waitForFirstItineraryRow();
    browser.pause(1000);
    itinerarySummary.chooseFirstItinerarySuggestion();

    const itineraryInstructions = browser.page.itineraryInstructions();
    itineraryInstructions.waitForFirstItineraryInstructionColumn();
    itineraryInstructions.verifyOrigin('Malmin kauppatie');
    itineraryInstructions.verifyDestination('Pasila');
    browser.end();
  },
};

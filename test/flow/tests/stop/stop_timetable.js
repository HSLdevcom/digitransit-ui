module.exports = {
  tags: ['stops', 'timetable'],
  'Open Ruoholahden villat stop and go to timetable tab to see all todays departures': browser => {
    browser.url(browser.launch_url);
    browser.page.searchFields().selectTimetableForFirstResult('0822');

    const stop = browser.page.stopCard();
    stop.waitForElementVisible(
      '@inactiveTab',
      browser.globals.itinerarySearchTimeout,
    );
    stop.click('@inactiveTab');
    stop.waitForElementVisible(
      '@timetable',
      browser.globals.itinerarySearchTimeout,
    );
    stop.waitForElementVisible(
      '@timetableRow',
      browser.globals.itinerarySearchTimeout,
    );
    browser.end();
  },
};

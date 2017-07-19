module.exports = {
  tags: ['stops', 'search', 'smoke'],
  'Search for 1240 (Kamppi) and verify that the title is correct': browser => {
    browser.url(browser.launch_url);

    browser.page.searchFields().selectTimetableForFirstResult('1240');

    browser.page.stopCard().expectCardHeaderDescription('Fredrikinkatu 65');
    browser.page.stopCard().waitForDepartureVisible();

    browser.end();
  },
};

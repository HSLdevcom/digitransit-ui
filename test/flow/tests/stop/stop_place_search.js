module.exports = {
  tags: ['stops', 'search', 'smoke'],
  'Search for H1240 (Kamppi) and verify that the title is correct': browser => {
    browser.url(browser.launch_url);

    browser.page.searchFields().selectTimetableForFirstResult('H1249');

    browser.page.stopCard().expectCardHeaderDescription('Kamppi');
    browser.page.stopCard().waitForDepartureVisible();

    browser.end();
  },
};

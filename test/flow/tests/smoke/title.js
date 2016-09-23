module.exports = {
  '@tags': ['smoke'],
  'Page should have title Rutebanken': (browser) => {
    browser
      .url(browser.launch_url)
      .assert.containsText('.title', 'Reittiopas')
      .end();
  },
};

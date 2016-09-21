module.exports = {
  '@tags': ['smoke'],
  'Page should have title Reittiopas.fi': (browser) => {
    browser
      .url(browser.launch_url)
      .assert.containsText('.title', 'Reittiopas.fi')
      .end();
  },
};

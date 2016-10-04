module.exports = {
  '@tags': ['smoke'],
  'Page should have title logo': (browser) => {
    browser
      .url(browser.launch_url)
      .assert.visible('.title .logo')
      .end();
  },
};

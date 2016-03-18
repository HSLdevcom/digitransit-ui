module.exports = {
  
  'Page title' : function (browser) {
    browser
      .url(browser.launch_url)
      .assert.title("Rutebanken")
      .end();
  }
};

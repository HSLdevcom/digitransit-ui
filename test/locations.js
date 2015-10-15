module.exports = {
  '@tags': ['nophantom'],

  'Geolocationing is in progress': function (browser) {
    browser.init();
    browser.expect.element(
      '.search-form > .row:nth-child(1) input').not.to.be.present;
    browser.expect.element(
      '.search-form > .row:nth-child(1) span.cursor-pointer').to.be.present;
  },

  'Geolocation can be stopped' : function (browser) {
    browser.click('.search-form > .row:nth-child(1) span.cursor-pointer');
    browser.expect.element('.search-form > .row:nth-child(1) input').to.be.present;
  },
  'Search works' : function (b) {
    b.setValue('.search-form > .row:nth-child(1) input', 'Sampsantie, helsinki');
    b.waitForElementVisible("[id='Sampsantie 2, 00610 Käpylä']", 1000);
    b.click("[id='Sampsantie 2, 00610 Käpylä']");
    b.end();
  }

};

module.exports = {
  'Frontpage map loads' : function (browser) {
    browser.url('http://matka.hsl.fi/digitransit-ui/');
    browser.expect.element('div.leaflet-map-pane').to.be.visible;
    browser.expect.element('span.title').text.to.contain('Digitransit');
  },

  'Geolocationing is in progress': function (browser) {
    browser.expect.element(
      '.search-form > .row:nth-child(1) input').not.to.be.present;
    browser.expect.element(
      '.search-form > .row:nth-child(1) span.cursor-pointer').to.be.present;
  },

  'Geolocation can be stopped' : function (browser) {
    browser.click('.search-form > .row:nth-child(1) span.cursor-pointer');
    browser.expect.element('.search-form > .row:nth-child(1) input').to.be.present;
  },

  'Stops menu opens' : function (browser) {
    browser.click('.tabs-row li:nth-child(2)');
    browser.expect.element('.frontpage-panel-wrapper').to.be.visible;
  },

  'Stops menu closes' : function (browser) {
    browser.click('.tabs-row li:nth-child(2)');
    browser.expect.element('.frontpage-panel-wrapper').not.to.be.present;
  },

  'Search works' : function (b) {
    b.setValue('.search-form > .row:nth-child(1) input', 'Sampsantie, helsinki');
    b.waitForElementVisible("Sampsantie, Helsinki", 1000);
    b.click("Sampsantie, Helsinki");
  }
};

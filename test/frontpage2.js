module.exports = {
  'Frontpage map loads' : function (browser) {
    browser.init();
    browser.expect.element('div.leaflet-map-pane').to.be.visible;
    browser.expect.element('span.title').text.to.contain('Digitransit');
  },

  'Stops menu opens' : function (browser) {
    browser.click('.tabs-row li:nth-child(2)');
    browser.expect.element('.frontpage-panel-wrapper').to.be.visible;
  },

  'Stops menu closes' : function (browser) {
    browser.click('.tabs-row li:nth-child(2)');
    browser.expect.element('.frontpage-panel-wrapper').not.to.be.present;
    browser.end();
  }};

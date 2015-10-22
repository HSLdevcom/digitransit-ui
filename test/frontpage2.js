module.exports = {
  before: function (browser) {
    browser.init();
  },

  after: function (browser) {
    browser.end();
  },

  'Frontpage map loads': function (browser) {
    browser.expect.element('div.leaflet-map-pane').to.be.visible;
    browser.expect.element('span.title').text.to.contain('Digitransit');
  },

  'Stops menu opens': function (browser) {
    browser.click('.tabs-row li:nth-child(2)');
    browser.expect.element('.frontpage-panel-wrapper').to.be.visible;
    browser.expect.element('.cards').to.be.present.before(1000);
    browser.expect.element('.cards .card:first-child .h4').text.to.contain('MÄKELÄNRINNE');
  },

  'Stops menu closes': function (browser) {
    browser.click('.tabs-row li:nth-child(2)');
    browser.expect.element('.frontpage-panel-wrapper').not.to.be.present;
  }
};

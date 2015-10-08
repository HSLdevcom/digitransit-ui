module.exports = {
  'Frontpage map loads' : function (browser) {
    browser
      .url('http://matka.hsl.fi/digitransit-ui/')
      .assert.visible('div.leaflet-map-pane')
      .assert.containsText('span.title', 'fooDigitransit')
  },

  'Stops menu opens' : function (browser) {
    browser
      .click('.tabs-row li:nth-child(2)')
      .assert.visible('.frontpage-panel-wrapper')
  },

  'Stops menu closes' : function (browser) {
    browser.click('.tabs-row li:nth-child(2)')
      .assert.elementNotPresent('.frontpage-panel-wrapper')
      .end();
  }
};

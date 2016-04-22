/* eslint no-unused-expressions: "off", prefer-arrow-callback: "off" */
// The test framework abuses property getters
const suite = require('./api/suite.js').suite;

suite('Frontpage', () => {
  it('should have title', function (browser) {
    browser.expect.element('span.title').text.to.contain('Reittiopas.fi');
  });

  it('should contain map', function (browser) {
    browser.expect.map().to.be.visible;
  });
});

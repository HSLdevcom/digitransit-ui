/* eslint-disable no-unused-expressions, prefer-arrow-callback */
// The test framework abuses property getters
const suite = require('./api/suite.js').suite;

suite('Frontpage', () => {
  it('should have title', (browser) => {
    browser.expect.element('span.title').text.to.contain('Reittiopas.fi');
  });

  it('should contain map', (browser) => {
    browser.expect.map().to.be.visible;
  });
});

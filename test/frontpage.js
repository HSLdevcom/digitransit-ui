var suite = require('./suite.js').suite;

suite('Frontpage', function () {
  it('should have title', function (browser) {
    browser.expect.element('span.title').text.to.contain('Digitransit');
  });

  it('should contain map', function (browser) {
    browser.expect.map().to.be.visible;
  });
});

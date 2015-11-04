describe('Frontpage', function () {
  this.timeout(120000);

  before(function (browser, done) {
    require('./browser-upgrade.js')(browser);
    browser.init(done);
  });

  after(function (browser, done) {
    browser.finish(done);
  });

  it('should have title', function (browser) {
    browser.expect.element('span.title').text.to.contain('Digitransit');
  });

  it('should contain map', function (browser) {
    browser.expect.map().to.be.visible;
  });
});

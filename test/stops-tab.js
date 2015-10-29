describe('Stop tab', function () {
  before(function (browser, done) {
    require('./browser-upgrade.js')(browser);
    browser.init(done);
  });

  after(function (browser, done) {
    browser.end(function () {
      done();
    });
  });

  describe('at Mäkelänrinne', function () {
    before(function (browser, done) {
      browser.setCurrentPosition(60.2, 24.95, 0, done);
    });

    describe('when clicked', function () {
      before(function (browser, done) {
        browser.stopsTab.click(done);
      });

      it('should open', function (browser) {
        browser.expect.element('.frontpage-panel-wrapper').to.be.visible;
      });

      it('should contain stop card', function (browser) {
        browser.expect.element('.cards').to.be.present.before(1000);
        browser.expect.element('.cards .card:first-child .h4').text.to.contain('MÄKELÄNRINNE');
      });

      describe('when location changes to Bulevardi', function () {
        before(function (browser, done) {
          browser.setCurrentPosition(60.1661419, 24.9373367, 0, done);
        });

        it('should update stop page to contain Bulevardi', function (browser) {
          browser.expect.element('.cards').to.be.present.before(2000);
          browser.expect.element('.cards .card:first-child .h4').text.to.contain('BULEVARDI');
        });
      });
    });
  });
});


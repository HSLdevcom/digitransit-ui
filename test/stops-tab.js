var suite = require('./api/suite.js').suite;

suite('Stop tab', function () {
  describe('at Mäkelänrinne', function () {
    before(function (browser, done) {
      browser.setCurrentPosition(60.2, 24.95, 0, done);
    });

    describe('when clicked', function () {
      before(function (browser, done) {
        browser.stopsTab.click(done);
      });

      it('should open', function (browser) {
        browser.expect.element('.frontpage-panel-wrapper').to.be.visible.before(500);;
      });

      it('should contain stop card', function (browser) {
        browser.expect.element('.cards .card:first-child .h4').to.be.present.before(500);;
        browser.expect.element('.cards .card:first-child .h4').text.to.contain('MÄKELÄNRINNE');
      });

      describe('when location changes to Bulevardi', function () {
        before(function (browser, done) {
          browser.setCurrentPosition(60.1661419, 24.9373367, 0, done);
        });

        it('should not update stop tab yet', function (browser) {
          browser.expect.element('.cards .card:first-child .h4').to.be.present.before(500);;
          browser.expect.element('.cards .card:first-child .h4').text.to.contain('MÄKELÄNRINNE');
        });

        describe('but when stop tab is reopened', function () {
          before(function (browser, done) {
            browser.stopsTab.click(function () {
              browser.stopsTab.click(done);
            });
          });

          it('should contain Bulevardi', function (browser) {
            browser.expect.element('.cards .card:first-child .h4').to.be.present.before(500);;
            browser.expect.element('.cards .card:first-child .h4').text.to.contain('BULEVARDI');
          });
        });
      });
    });
  });
});

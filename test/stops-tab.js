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
        browser.expect.element('.frontpage-panel-wrapper').to.be.visible.before(browser.ELEMENT_VISIBLE_TIMEOUT);
      });

      it('should contain stop card', function (browser) {
        browser.expect.element('.cards .card:first-child .h4').to.be.present.before(browser.ELEMENT_VISIBLE_TIMEOUT);
        browser.expect.element('.cards .card:first-child .h4').text.to.contain('MÄKELÄNRINNE');
      });

      describe('when location changes to Bulevardi', function () {
        before(function (browser, done) {
          browser.setCurrentPosition(60.1661419, 24.9373367, 0, done);
        });
        it('the contents of stop tab should update', function (browser) {
          browser.pause(1000);
          browser.expect.element('.cards .card:first-child .h4').to.be.present.before(browser.ELEMENT_VISIBLE_TIMEOUT);
          browser.expect.element('.cards .card:first-child .h4').text.to.contain('BULEVARDI');
        });
      });
    });
  });
});

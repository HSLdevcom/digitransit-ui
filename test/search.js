var suite = require('./api/suite.js').suite;

suite('Search', function () {
  before(function (browser, done) {
    browser.setCurrentPosition(60.2, 24.95, 0, done);
  });

  describe('When Origin is manually set to "Kamppi"', function () {

    before(function (browser, done) {
      browser.origin.disableCurrentPosition(function () {
        browser.origin.enableInput(function () {
          browser.expect.element('#origin-autosuggest > div > input[type=text]').to.be.present.before(500);
          browser.origin.enterText("Kamppi", done);
        })
      })
    });

    it('should remain set to "Kamppi" when Origin input receives and loses focus', function (browser) {
      browser.origin.clickInput(function () {
        browser.pause(500, function () {  //for safari
          browser.assert.value('#origin-autosuggest > div > input[type=text]', "Kamppi, Helsinki");
          browser.map.click(function () {
            browser.assert.value('#origin-autosuggest > div > input[type=text]', "Kamppi, Helsinki");
          })
        });
      });
    });

    it('should be possible to write Destination', function (browser) {
      browser.expect.element('#destination-autosuggest > div > input[type=text]').to.be.present.before(500);
      browser.destination.enterText("Kluuvi", function () {
        browser.pause(500, function () { //for safari
          browser.assert.value('#destination-autosuggest > div > input[type=text]', "Kluuvi, Helsinki");
        });
      });
    });

    it('should use "Sampsantie 40, Helsinki" address when Destination is written as "sampsantie 40"', function (browser) {
      browser.destination.enterText("\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\bsampsantie 40", function () {
        browser.pause(500, function () { //for safari
          browser.assert.value('#destination-autosuggest > div > input[type=text]', "Sampsantie 40, Helsinki");
        });
      });
    });
//TODO not implemented yet
//    it('should show special position marker because position is manually set', function (browser) {
    // blue marker
//      browser.end()
//    });


    it('should be possible to use current position', function (browser) {
      browser.destination.enterText("\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b\b", function () {
        browser.map.click(function () {
          browser.destination.enableCurrentPosition(function () {
            browser.expect.element('#destination-geolocationbar').to.be.visible.before(500);
            browser.end();
          });
        });
      });
    });


  });

  describe('When Origin is "My position"', function () {
    it('should show animated user position marker', function (browser) {
      // user position
      browser.end()
    });
  });

  describe('When Origin and Destination are set', function () {
    it('should read values from session store during browser back', function (browser) {
      browser.end()
    });
  });
});

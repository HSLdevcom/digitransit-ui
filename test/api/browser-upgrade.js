module.exports = function (browser) {
  var GLOBAL_TIMEOUT_MS = 180000;
  var ELEMENT_VISIBLE_TIMEOUT = 5000;

  browser.finish = function (done) {
    browser.end(function () {
      done();
    });
  };

  browser.setCurrentPosition = function (lat, lon, heading, done) {
    browser.execute(function (lat, lon, heading) {
      window.mock.geolocation.setCurrentPosition(lat, lon, heading);
    }, [lat, lon, heading], function (result) {
      done();
    });
  };

  browser.init = function (url, done) {
    var launch_url = browser.launch_url + '/';
    if (typeof(url) === 'string') {
      if (url.indexOf('http://') === 0) {
        launch_url = url;
      } else {
        launch_url = browser.launch_url + url;
      }
    } else {
      done = url;
    }

    launch_url = launch_url + '?mock';

    browser.timeouts('script', GLOBAL_TIMEOUT_MS, function () {
      browser.timeouts('implicit', GLOBAL_TIMEOUT_MS, function () {
        browser.timeouts('page load', GLOBAL_TIMEOUT_MS, function () {
          browser.url(launch_url, function () {
            done();
          });
        });
      });
    });
  };

  browser.expect.map = function () {
    return browser.expect.element('div.leaflet-map-pane');
  };

  browser.stopsTab = {};
  browser.stopsTab.click = function (done) {
    browser.click('.tabs-row .nearby-stops', function () {
      done();
    });
  };

  //map functions
  browser.map = {
    click: function (done) {
      browser.click('div.map', done);
    }
  }

  //origin functions
  browser.origin = {
    disableCurrentPosition: function () {
      browser.expect.element('#origin-geolocationbar').to.be.visible.before(ELEMENT_VISIBLE_TIMEOUT);
      return browser.click('#origin-geolocationbar');
    },
    enableCurrentPosition: function () {
      return browser.click('#origin-placeholder-locate')
    },
    enableInput: function () {
      browser.expect.element('#origin-placeholder-input').to.be.visible.before(ELEMENT_VISIBLE_TIMEOUT);
      return browser.click('#origin-placeholder-input')

    },
    enterText: function type(text) {
      browser.expect.element('#origin-autosuggest > div > input[type=text]').to.be.visible.before(ELEMENT_VISIBLE_TIMEOUT);
      return browser.setValue('#origin-autosuggest > div > input[type=text]', text + browser.Keys.ENTER);
    },
    clickInput: function () {
      browser.expect.element('#origin-autosuggest > div > input[type=text]').to.be.visible.before(ELEMENT_VISIBLE_TIMEOUT);
      return browser.click("#origin-autosuggest > div > input[type=text]");
    },
    clearInput: function (done) {
      browser.expect.element('#origin-autosuggest > div > input[type=text]').to.be.visible.before(ELEMENT_VISIBLE_TIMEOUT);
      return browser.clearValue('#origin-autosuggest > div > input[type=text]');
    }
  }
  //destination functions
  browser.destination = {
    disableCurrentPosition: function () {
      browser.expect.element('#destination-geolocationbar').to.be.visible.before(ELEMENT_VISIBLE_TIMEOUT);
      browser.click('#destination-geolocationbar');
    },
    enableCurrentPosition: function () {
      browser.click('#destination-placeholder-locate')
    },
    enableInput: function () {
      browser.click('#destination-placeholder-input');
    },
    enterText: function type(text) {
      browser.expect.element('#destination-autosuggest > div > input[type=text]').to.be.visible.before(ELEMENT_VISIBLE_TIMEOUT);
      browser.setValue('#destination-autosuggest > div > input[type=text]', text + browser.Keys.ENTER);
    },
    clickInput: function () {
      browser.click("#destination-autosuggest > div > input[type=text]");
    },
    clearInput: function () {
      browser.clearValue('#destination-autosuggest > div > input[type=text]');
    }

  }

};

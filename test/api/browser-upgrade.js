module.exports = function (browser) {

  if (browser.ELEMENT_VISIBLE_TIMEOUT) return;
  var GLOBAL_TIMEOUT_MS = 180000;
  var ELEMENT_VISIBLE_TIMEOUT = 10000;
  browser.ELEMENT_VISIBLE_TIMEOUT = ELEMENT_VISIBLE_TIMEOUT;

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

  browser.url = function(ex) {
    return function(url,done) {

      var launchUrl = url || browser.launch_url + '/';
      if (launchUrl.indexOf('http://') != 0) {
        launchUrl = browser.launch_url + url;
      }
      launchUrl = launchUrl + "?mock";
      ex(launchUrl, done);
    }
  }(browser.url)

  browser.init = function (url, done) {
    var launch_url;
    if (typeof(url) === 'string') {
      launch_url = url;
    } else {
      done = url;
    }

    console.log('snap_commit_short=' + process.env.SNAP_COMMIT_SHORT);
    console.log('launch_url=' + (launch_url || 'default'));

    browser.timeouts('script', GLOBAL_TIMEOUT_MS, function () {
      browser.timeouts('implicit', GLOBAL_TIMEOUT_MS, function () {
        browser.timeouts('page load', GLOBAL_TIMEOUT_MS, function () {
          browser.url(launch_url, function () {
            console.log('session id=' + browser.sessionId);
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

    openSearch: function() {
      browser.expect.element('#origin').to.be.visible.before(ELEMENT_VISIBLE_TIMEOUT);
      browser.click('#origin');
    },

    enterText: function type(text) {
      browser.expect.element('#autosuggest-input').to.be.enabled.before(ELEMENT_VISIBLE_TIMEOUT);
      browser.pause(100);
      browser.setValue('#autosuggest-input', text);
      browser.pause(1000); //wait for suggestions
      browser.setValue('#autosuggest-input', browser.Keys.ENTER);
      browser.pause(100); //wait for dialog to vanish
      }
  }
  //destination functions
  browser.destination = {
    openSearch: function() {
      browser.expect.element('#destination').to.be.visible.before(ELEMENT_VISIBLE_TIMEOUT);
      browser.click('#destination');
    },

    enterText: browser.origin.enterText,


  }

};

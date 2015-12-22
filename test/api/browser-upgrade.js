module.exports = function (browser) {
  var GLOBAL_TIMEOUT_MS = 180000;

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
      browser.click('div.leaflet-map-pane', done);
    }
  }

  //origin functions
  browser.origin = {
    disableCurrentPosition: function (done) {
      //    console.log("disable current position");
      browser.expect.element('#origin-geolocationbar').to.be.visible.before(500);
      browser.click('#origin-geolocationbar', function () {
        //       browser.expect.element('#origin-placeholder-input').to.be.visible.before(500);
        //       console.log("disable current position->");
        done()
      })
    },
    enableCurrentPosition: function (done) {
      browser.click('#origin-placeholder-locate')
    },
    enableInput: function (done) {
//      console.log("enable input");
      browser.expect.element('#origin-placeholder-input').to.be.visible.before(500);
      browser.click('#origin-placeholder-input', function () {
        browser.pause(10, function () {
//          browser.expect.element('#origin-autosuggest').to.be.visible.before(500);
//          console.log("enable input->");
          done();
        })

      })
    },
    enterText: function type(text, done) {
//      console.log("enter text:", text);
      browser.expect.element('#origin-autosuggest > div > input[type=text]').to.be.visible.before(500);
      browser.setValue('#origin-autosuggest > div > input[type=text]', [text, browser.Keys.ENTER], function () {
        done();
      });
    },
    clickInput: function (done) {
      browser.click("#origin-autosuggest > div > input[type=text]", done);
    },
    clearInput: function (done) {
      browser.clearValue('#origin-autosuggest > div > input[type=text]', done);
    }
  }
  //destination functions
  browser.destination = {
    disableCurrentPosition: function (done) {
      //    console.log("disable current position");
      browser.expect.element('#destination-geolocationbar').to.be.visible.before(500);
      browser.click('#destination-geolocationbar', function () {
        //       browser.expect.element('#origin-placeholder-input').to.be.visible.before(500);
        //       console.log("disable current position->");
        done()
      })
    },
    enableCurrentPosition: function (done) {
      browser.click('#destination-placeholder-locate')
    },
    enableInput: function (done) {
//      console.log("enable input");
//      browser.expect.element('#destination-placeholder-input').to.be.visible.before(500);
      browser.click('#destination-placeholder-input', function () {
        browser.pause(10, function () {
//          browser.expect.element('#origin-autosuggest').to.be.visible.before(500);
//          console.log("enable input->");
          done();
        })

      })
    },
    enterText: function type(text, done) {
//      console.log("enter text:", text);
      browser.expect.element('#destination-autosuggest > div > input[type=text]').to.be.visible.before(500);
      browser.setValue('#destination-autosuggest > div > input[type=text]', [text, browser.Keys.ENTER], function () {
        done();
      });
    },
    clickInput: function (done) {
      browser.click("#destination-autosuggest > div > input[type=text]", done);
    },
    clearInput: function (done) {
      browser.clearValue('#destination-autosuggest > div > input[type=text]', done);
    }

  }

};

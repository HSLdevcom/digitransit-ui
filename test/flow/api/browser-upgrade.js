/* eslint prefer-arrow-callback: 0, no-console: 0,
          no-param-reassign: 0, strict: 0, prefer-template: 0 */
'use strict';

module.exports = function (browser) {
  if (browser.ELEMENT_VISIBLE_TIMEOUT) return;
  const ELEMENT_VISIBLE_TIMEOUT = 10000;
  browser.ELEMENT_VISIBLE_TIMEOUT = ELEMENT_VISIBLE_TIMEOUT;

  browser.finish = function finish(done) {
    browser.end(function () {
      done();
    });
  };

  browser.setCurrentPosition = function setCurrentPosition(lat, lon, heading, done) {
    return browser.execute(function (lat2, lon2, heading2) {
      window.mock.geolocation.setCurrentPosition(lat2, lon2, heading2, true);
    }, [lat, lon, heading], function () {
      if (done) {
        done();
      }
    });
  };

  browser.url = (function makeUrl(ex) {
    return function url(urlArg, done) {
      let launchUrl = urlArg || `${browser.launch_url}/`;
      if (launchUrl.indexOf('http://') !== 0) {
        launchUrl = browser.launch_url + urlArg;
      }
      launchUrl = `${launchUrl}?mock`;
      return ex(launchUrl, done);
    };
  }(browser.url));

  browser.init = (url, done) => {
    let launchUrl;
    if (typeof(url) === 'string') {
      launchUrl = url;
    } else {
      done = url;
    }

    console.log(`snap_commit_short=${process.env.SNAP_COMMIT_SHORT}`);
    console.log(`launchUrl=${launchUrl || 'default'}`);

    browser.url(launchUrl, () => {
      console.log('session id=' + browser.sessionId);
      done();
    });
  };

  browser.expect.map = () => browser.expect.element('div.leaflet-map-pane');

  browser.stopsTab = {};
  browser.stopsTab.click = () =>
    browser
      .waitForElementVisible('.tabs-row .nearby-stops', ELEMENT_VISIBLE_TIMEOUT)
      .click('.tabs-row .nearby-stops');

  browser.map = {
    click: () =>
      browser.click('div.map')
    ,
  };

  browser.fakeSearch = {};
  browser.fakeSearch.openSearch = () =>
    browser
      .waitForElementVisible('#front-page-search-bar', ELEMENT_VISIBLE_TIMEOUT)
      .click('#front-page-search-bar');

  browser.origin = {
    popup: {
      click: () =>
        browser
          .waitForElementVisible('.origin-popup-name', ELEMENT_VISIBLE_TIMEOUT)
          .click('.origin-popup-name'),
    },
    clear: () =>
      browser
        .waitForElementVisible('.clear-icon', ELEMENT_VISIBLE_TIMEOUT)
        .click('.clear-icon'),
    selectOrigin: () =>
      browser
        .waitForElementVisible('#origin', ELEMENT_VISIBLE_TIMEOUT)
        .click('#origin'),
    enterText: (text) =>
      browser
        .waitForElementVisible('#search-origin', ELEMENT_VISIBLE_TIMEOUT)
        .setValue('#search-origin', text)
        .pause(1000)
        .setValue('#search-origin', browser.Keys.ENTER)
        .pause(100),
  };

  browser.destination = {
    selectDestination: () =>
      browser
        .waitForElementVisible('#destination', ELEMENT_VISIBLE_TIMEOUT)
        .click('#destination'),
    openSearch: () =>
      browser
        .waitForElementVisible('#destination', ELEMENT_VISIBLE_TIMEOUT)
        .click('#destination'),
    enterText: (text) =>
      browser
        .setValue('#search-destination', text)
        .pause(1000)
        .setValue('#search-destination', browser.Keys.ENTER)
        .pause(100),
  };

  browser.setOrigin = (src) =>
    browser.fakeSearch.openSearch()
      .origin.selectOrigin()
      .origin.enterText(src);

  browser.setDestination = (src) =>
    browser.fakeSearch.openSearch()
      .destination.selectDestination()
      .destination.enterText(src);
};

/* eslint-disable no-console */
const AxeBuilder = require('@axe-core/webdriverjs');
const WebDriver = require('selenium-webdriver');

const URL = 'http://127.0.0.1:8080/';

const driver = new WebDriver.Builder().forBrowser('firefox').build();

/* const URLS_TO_TEST = [
  'http://127.0.0.1:8080/etusivu', // front page
  'http://127.0.0.1:8080/linjat/HSL:3002P', // P train route page
  'http://127.0.0.1:8080/linjat/HSL:3002P/aikataulu/', // P train timetable page
  'http://127.0.0.1:8080/terminaalit/HSL%3A2000102', // Metro terminal stop page
]; */

// TODO iterate over multiple urls

// const totalResults = {};

driver.get(URL).then(() => {
  console.log('page loaded...');
  new AxeBuilder(driver).analyze((err, results) => {
    console.log('RESULTS: ');
    if (err) {
      // TODO Handle error somehow
      console.log(err);
    }
    // TODO configure? or filter out unnecessary stuff
    // console.log(results);
    console.log('Violations: ');
    // console.log(results.violations);
    const { violations } = results;
    const color = {
      critical: '\x1b[1m\x1b[31m',
      serious: '\x1b[31m',
      moderate: '\x1b[1m\x1b[33m',
      minor: '\x1b[33m',
    };
    for (let i = 0; i < results.violations.length; i++) {
      const v = violations[i];
      console.log(
        color[v.impact],
        `${v.impact} - ${v.id}: ${v.help}`,
        '\x1b[0m',
      );
    }

    console.log('=== ACCESSIBILITY TESTS DONE ===');
    console.log(
      `violations: ${results.violations.length}, passes: ${results.passes.length}, incomplete: ${results.incomplete.length}, inapplicable: ${results.inapplicable.length}`,
    );

    driver.quit();
  });
});

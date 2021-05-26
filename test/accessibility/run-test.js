/* eslint-disable no-console */
const AxeBuilder = require('@axe-core/webdriverjs');
const WebDriver = require('selenium-webdriver');

const driver = new WebDriver.Builder().forBrowser('firefox').build();

const URLS_TO_TEST = [
  'http://127.0.0.1:8080/etusivu', // front page
  'http://127.0.0.1:8080/linjat/HSL:3002P', // P train route page
  'http://127.0.0.1:8080/linjat/HSL:3002P/aikataulu/', // P train timetable page
  'http://127.0.0.1:8080/terminaalit/HSL%3A2000102', // Metro terminal stop page
];

const totalResults = {
  violations: [],
  passes: [],
  incomplete: [],
  inapplicable: [],
};
const color = {
  critical: '\x1b[1m\x1b[31m',
  serious: '\x1b[31m',
  moderate: '\x1b[1m\x1b[33m',
  minor: '\x1b[33m',
};

const wrapup = () => {
  console.timeEnd('Execution time');
  console.log('=== ACCESSIBILITY TESTS DONE ===');
  console.log(
    `violations: ${totalResults.violations.length}, passes: ${totalResults.passes.length}, incomplete: ${totalResults.incomplete.length}, inapplicable: ${totalResults.inapplicable.length}`,
  );
  driver.quit();
};

// Loop through URLs recursively
const analyzePages = i => {
  if (i < URLS_TO_TEST.length) {
    const url = URLS_TO_TEST[i];
    driver.get(url).then(() => {
      console.log(`${url} loaded...`);
      new AxeBuilder(driver).analyze((err, results) => {
        console.log(`RESULTS for ${url}: `);
        if (err) {
          // TODO Handle error somehow
          console.log(err);
        }

        const { violations, passes, incomplete, inapplicable } = results;
        totalResults.violations = [...totalResults.violations, ...violations];
        totalResults.passes = [...totalResults.passes, ...passes];
        totalResults.incomplete = [...totalResults.incomplete, ...incomplete];
        totalResults.inapplicable = [
          ...totalResults.inapplicable,
          ...inapplicable,
        ];

        console.log('Violations: ');
        for (let j = 0; j < results.violations.length; j++) {
          const v = violations[j];
          console.log(
            color[v.impact],
            `${v.impact} - ${v.id}: ${v.help}`,
            '\x1b[0m',
          );
        }
        analyzePages(i + 1);
      });
    });
  } else {
    wrapup();
  }
};

console.time('Execution time');
analyzePages(0);

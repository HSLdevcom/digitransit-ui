/* eslint-disable no-console */
const AxeBuilder = require('@axe-core/webdriverjs');
const WebDriver = require('selenium-webdriver');

const driver = new WebDriver.Builder().forBrowser('firefox').build();
const builder = new AxeBuilder(driver);

const URLS_TO_TEST = [
  'http://127.0.0.1:8080/etusivu', // front page
  'http://127.0.0.1:8080/linjat/HSL:3002P', // P train route page
  'http://127.0.0.1:8080/reitti/Otakaari%2024%2C%20Espoo%3A%3A60.1850004462205%2C24.832384918447488/L%C3%B6nnrotinkatu%2029%2C%20Helsinki%3A%3A60.164182342362864%2C24.932237237563104', // ititnerary suggestions
  'http://127.0.0.1:8080/reitti/Otakaari%2024%2C%20Espoo%3A%3A60.1850004462205%2C24.832384918447488/L%C3%B6nnrotinkatu%2029%2C%20Helsinki%3A%3A60.164182342362864%2C24.932237237563104/0', // Itinerary page
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
  moderate: '\x1b[33m',
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
      builder.analyze((err, results) => {
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
          const firstTargetElement =
            v.nodes.length > 0 ? `- on element: ${v.nodes[0].target[0]}` : '';
          console.log(
            color[v.impact],
            `${v.impact} - ${v.id}: ${v.help} ${firstTargetElement}`,
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

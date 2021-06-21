/* eslint-disable no-console */
const parallel = require('async/parallel');
const AxeBuilder = require('@axe-core/webdriverjs');
const WebDriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

const args = process.argv.slice(2);
const onlyTestLocal = args.includes('local');
console.log(`Testing against benchmark: ${!onlyTestLocal}`);

const driver1 = new WebDriver.Builder()
  .forBrowser('firefox')
  .setFirefoxOptions(new firefox.Options().headless())
  .build();
const builder1 = new AxeBuilder(driver1)
  .exclude('.map')
  .disableRules('color-contrast'); // Color-contrast checks seem inconsistent, can be possibly enabled in newer axe versions

let driver2;
let builder2;
if (!onlyTestLocal) {
  driver2 = new WebDriver.Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(new firefox.Options().headless())
    .build();
  builder2 = new AxeBuilder(driver2)
    .exclude('.map')
    .disableRules('color-contrast');
}

const LOCAL = 'http://127.0.0.1:8080';
const BENCHMARK = 'https://next-dev.digitransit.fi';
const RERUN_COUNT = 1;

let CURRENT_RUN = 0;
let URLS_TO_TEST = [
  '/etusivu', // front page
  '/linjat/HSL:3002P', // P train route page
  '/linjat/HSL:3002P/aikataulu/HSL:3002P:0:01', // P train timetable view
  '/lahellasi/BUS/Rautatientori%2C%20Helsinki::60.170384,24.939846', // Stops near you
  '/reitti/Otakaari%2024%2C%20Espoo%3A%3A60.1850004462205%2C24.832384918447488/L%C3%B6nnrotinkatu%2029%2C%20Helsinki%3A%3A60.164182342362864%2C24.932237237563104', // ititnerary suggestions
  // '/reitti/Otakaari%2024%2C%20Espoo%3A%3A60.1850004462205%2C24.832384918447488/L%C3%B6nnrotinkatu%2029%2C%20Helsinki%3A%3A60.164182342362864%2C24.932237237563104/0', // Itinerary page
];

const localResults = {
  violations: [],
  passes: [],
  incomplete: [],
  inapplicable: [],
};
const benchmarkResults = {
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

const printTestResults = (results, printResults, url, i) => {
  const { violations } = results;
  if (printResults) {
    console.log(`RESULTS for ${url}: `);
    console.log('Violations: ');
  }
  for (let j = 0; j < results.violations.length; j++) {
    const v = violations[j];
    v.url = URLS_TO_TEST[i];
    const firstTargetElement =
      v.nodes.length > 0 ? `- on element: ${v.nodes[0].target[0]}` : '';
    if (printResults) {
      console.log(
        color[v.impact],
        `${v.impact} - ${v.id}: ${v.help} ${firstTargetElement}`,
        '\x1b[0m',
      );
    }
  }
};

// Loop through URLs recursively
const analyzeLocal = (callback, i, printResults) => {
  if (i < URLS_TO_TEST.length) {
    const url = `${LOCAL}${URLS_TO_TEST[i]}`;
    driver1.get(url).then(() => {
      console.log(`${url} loaded...`);
      builder1.analyze((err, results) => {
        if (err) {
          // TODO Handle error somehow
          console.log(err);
        } else {
          const { violations, passes, incomplete, inapplicable } = results;
          localResults.violations = [...localResults.violations, ...violations];
          localResults.passes = [...localResults.passes, ...passes];
          localResults.incomplete = [...localResults.incomplete, ...incomplete];
          localResults.inapplicable = [
            ...localResults.inapplicable,
            ...inapplicable,
          ];

          printTestResults(results, printResults, url, i);
          analyzeLocal(callback, i + 1, printResults);
        }
      });
    });
  } else {
    callback(null);
  }
};

const analyzeBenchmark = (callback, i) => {
  if (i < URLS_TO_TEST.length) {
    const url = `${BENCHMARK}${URLS_TO_TEST[i]}`;
    driver2.get(url).then(() => {
      builder2.analyze((err, results) => {
        if (err) {
          // TODO Handle error somehow
          console.log(err);
        } else {
          const { violations, passes, incomplete, inapplicable } = results;
          benchmarkResults.violations = [
            ...benchmarkResults.violations,
            ...violations,
          ];
          benchmarkResults.passes = [...benchmarkResults.passes, ...passes];
          benchmarkResults.incomplete = [
            ...benchmarkResults.incomplete,
            ...incomplete,
          ];
          benchmarkResults.inapplicable = [
            ...benchmarkResults.inapplicable,
            ...inapplicable,
          ];

          printTestResults(results, false, url, i);
          analyzeBenchmark(callback, i + 1);
        }
      });
    });
  } else {
    callback(null);
  }
};

const violationsAreEqual = (v1, v2) => {
  return v1.url === v2.url && v1.id === v2.id;
};

const resetErrorsRelatedtoURL = urls => {
  localResults.violations = localResults.violations.filter(
    v => !urls.has(v.url),
  );
  localResults.passes = localResults.passes.filter(v => !urls.has(v.url));

  benchmarkResults.violations = benchmarkResults.violations.filter(
    v => !urls.has(v.url),
  );
  benchmarkResults.passes = benchmarkResults.passes.filter(
    v => !urls.has(v.url),
  );
};

const wrapup = () => {
  console.timeEnd('Execution time');
  if (CURRENT_RUN === 0) {
    console.log('=== ACCESSIBILITY TESTS DONE ===');
  }
  console.log(
    `violations in LOCAL: ${localResults.violations.length}, passes: ${localResults.passes.length}, incomplete: ${localResults.incomplete.length}, inapplicable: ${localResults.inapplicable.length}`,
  );
  if (!onlyTestLocal) {
    console.log(
      `violations in BENCHMARK: ${benchmarkResults.violations.length}, passes: ${benchmarkResults.passes.length}, incomplete: ${benchmarkResults.incomplete.length}, inapplicable: ${benchmarkResults.inapplicable.length}`,
    );
    const newViolations = localResults.violations.filter(v1 => {
      return !benchmarkResults.violations.some(v2 => {
        return violationsAreEqual(v1, v2);
      });
    });

    if (newViolations.length > 0) {
      if (CURRENT_RUN < RERUN_COUNT) {
        console.log('Found new violation, re-running the test to verify...');
        CURRENT_RUN += 1;
        const urlsWithErrors = new Set();
        newViolations.forEach(v => urlsWithErrors.add(v.url));
        resetErrorsRelatedtoURL(urlsWithErrors);
        URLS_TO_TEST = Array.from(urlsWithErrors);

        // eslint-disable-next-line no-use-before-define
        runTests(false);
        return;
      }
      console.log('New Errors introduced: ');
      let lastUrl = '';
      for (let j = 0; j < newViolations.length; j++) {
        const v = newViolations[j];
        if (lastUrl !== v.url) {
          lastUrl = v.url;
          console.log(`On url: ${LOCAL}${v.url}`);
        }
        const firstTargetElement =
          v.nodes.length > 0 ? `- on element: ${v.nodes[0].target[0]}` : '';
        console.log(
          color[v.impact],
          `${v.impact} - ${v.id}: ${v.help} ${firstTargetElement}`,
          '\x1b[0m',
        );
      }
      process.exitCode = 1;
    } else {
      console.log('No new erros');
    }
    driver2.quit();
  }

  driver1.quit();
};

const runTests = printResults => {
  console.time('Execution time');
  parallel(
    [
      callback => {
        analyzeLocal(callback, 0, printResults);
      },
      callback => {
        if (!onlyTestLocal) {
          analyzeBenchmark(callback, 0);
        } else {
          callback(null);
        }
      },
    ],
    err => {
      if (err) {
        console.error(err);
      }
      wrapup();
    },
  );
};

runTests(true);

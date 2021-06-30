/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
const parallel = require('async/parallel');
const AxeBuilder = require('@axe-core/webdriverjs');
const { Builder, By, Key } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

const args = process.argv.slice(2);
const onlyTestLocal = args.includes('local');
console.log(`Testing against benchmark: ${!onlyTestLocal}`);

const LOCAL = 'http://127.0.0.1:8080';
const BENCHMARK = 'https://next-dev.digitransit.fi';
const RERUN_COUNT = 1;

let CURRENT_RUN = 0;

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

const createDriver = () => {
  return new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(new firefox.Options().headless())
    .build();
};

const createBuilder = driver => {
  return new AxeBuilder(driver).exclude('.map').disableRules('color-contrast'); // Color-contrast checks seem inconsistent, can be possibly enabled in newer axe versions
};

const createTestEnv = () => {
  const driver = createDriver();
  const builder = createBuilder(driver);
  return [driver, builder];
};

const saveTestResults = (results, benchmark) => {
  const location = benchmark ? benchmarkResults : localResults;
  const { violations, passes, incomplete, inapplicable } = results;
  location.violations = [...location.violations, ...violations];
  location.passes = [...location.passes, ...passes];
  location.incomplete = [...location.incomplete, ...incomplete];
  location.inapplicable = [...location.inapplicable, ...inapplicable];
};

const printTestResults = (results, printResults, url) => {
  const { violations } = results;
  if (printResults) {
    console.log(`RESULTS for ${url}: `);
    console.log('Violations: ');
  }
  for (let j = 0; j < results.violations.length; j++) {
    const v = violations[j];
    v.url = url;
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

async function analyzeWithAxe(builder, printResults, benchmark, path) {
  return builder.analyze((err, results) => {
    if (err) {
      console.log(err);
    } else {
      saveTestResults(results, benchmark);
      printTestResults(results, printResults, path);
    }
  });
}

async function frontPageTest(rootUrl, printResults, benchmark, path) {
  const [driver, builder] = createTestEnv();
  const url = `${rootUrl}${path}`;
  await driver.get(url);
  await analyzeWithAxe(builder, printResults, benchmark, path);
  driver.quit();
}

async function routePageTest(rootUrl, printResults, benchmark, path) {
  const [driver, builder] = createTestEnv();
  const url = `${rootUrl}${path}`;
  await driver.get(url);
  await analyzeWithAxe(builder, printResults, benchmark, path);
  driver.quit();
}

async function routePageTimetableTest(rootUrl, printResults, benchmark, path) {
  const [driver, builder] = createTestEnv();
  const url = `${rootUrl}${path}`;
  await driver.get(url);
  await analyzeWithAxe(builder, printResults, benchmark, path);
  driver.quit();
}

async function terminalPageTimetableTest(
  rootUrl,
  printResults,
  benchmark,
  path,
) {
  const [driver, builder] = createTestEnv();
  const url = `${rootUrl}${path}`;
  await driver.get(url);
  // Open route select menu
  await driver
    .findElement(By.id('timetable-showroutes-button'))
    .sendKeys(Key.RETURN);
  await analyzeWithAxe(builder, printResults, benchmark, path);
  driver.quit();
}

async function stopsNearYouTest(rootUrl, printResults, benchmark, path) {
  const [driver, builder] = createTestEnv();
  const url = `${rootUrl}${path}`;
  await driver.get(url);
  await analyzeWithAxe(builder, printResults, benchmark, path);
  driver.quit();
}

async function ItineraryTest(rootUrl, printResults, benchmark, path) {
  const [driver, builder] = createTestEnv();
  const url = `${rootUrl}${path}`;
  await driver.get(url);
  // Open settings menu
  await driver
    .findElement(By.className('open-advanced-settings-window-button'))
    .sendKeys(Key.RETURN);
  await analyzeWithAxe(builder, printResults, benchmark, path);
  driver.quit();
}

const TEST_CASES = {
  '/etusivu': frontPageTest,
  '/linjat/HSL:3002P': routePageTest,
  '/linjat/HSL:3002P/aikataulu/HSL:3002P:0:01': routePageTimetableTest,
  '/terminaalit/HSL%3A2000102/aikataulu': terminalPageTimetableTest,
  '/lahellasi/BUS/Rautatientori%2C%20Helsinki::60.170384,24.939846': stopsNearYouTest,
  '/reitti/Otakaari%2024%2C%20Espoo%3A%3A60.1850004462205%2C24.832384918447488/L%C3%B6nnrotinkatu%2029%2C%20Helsinki%3A%3A60.164182342362864%2C24.932237237563104': ItineraryTest,
};

async function runTestCases(
  rootUrl,
  isBenchmark,
  callback,
  printResults,
  pathsToTest = undefined,
) {
  for (const [path, test] of Object.entries(TEST_CASES)) {
    if (pathsToTest) {
      if (pathsToTest.includes(path)) {
        await test(rootUrl, printResults, isBenchmark, path);
      }
    } else {
      await test(rootUrl, printResults, isBenchmark, path);
    }
  }
  callback(null);
}

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

        // eslint-disable-next-line no-use-before-define
        runTests(false, Array.from(urlsWithErrors));
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
  }
};

const runTests = (printResults, pathsToTest = undefined) => {
  console.time('Execution time');
  parallel(
    [
      callback => {
        runTestCases(LOCAL, false, callback, printResults, pathsToTest);
      },
      callback => {
        if (!onlyTestLocal) {
          runTestCases(BENCHMARK, true, callback, false, pathsToTest);
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

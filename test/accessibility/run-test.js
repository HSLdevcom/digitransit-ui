/* eslint-disable no-console */
const parallel = require('async/parallel');
const AxeBuilder = require('@axe-core/webdriverjs');
const WebDriver = require('selenium-webdriver');

const driver1 = new WebDriver.Builder().forBrowser('firefox').build();
const driver2 = new WebDriver.Builder().forBrowser('firefox').build();

const builder1 = new AxeBuilder(driver1);
const builder2 = new AxeBuilder(driver2);

const LOCAL = 'http://127.0.0.1:8080';
const BENCHMARK = 'https://next-dev.digitransit.fi';

const URLS_TO_TEST = [
  '/etusivu', // front page
  '/linjat/HSL:3002P', // P train route page
  '/reitti/Otakaari%2024%2C%20Espoo%3A%3A60.1850004462205%2C24.832384918447488/L%C3%B6nnrotinkatu%2029%2C%20Helsinki%3A%3A60.164182342362864%2C24.932237237563104', // ititnerary suggestions
  '/reitti/Otakaari%2024%2C%20Espoo%3A%3A60.1850004462205%2C24.832384918447488/L%C3%B6nnrotinkatu%2029%2C%20Helsinki%3A%3A60.164182342362864%2C24.932237237563104/0', // Itinerary page
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

// Loop through URLs recursively
const analyzeLocal = (callback, i) => {
  if (i < URLS_TO_TEST.length) {
    const url = `${LOCAL}${URLS_TO_TEST[i]}`;
    driver1.get(url).then(() => {
      console.log(`${url} loaded...`);
      builder1.analyze((err, results) => {
        console.log(`RESULTS for ${url}: `);
        if (err) {
          // TODO Handle error somehow
          console.log(err);
        }

        const { violations, passes, incomplete, inapplicable } = results;
        localResults.violations = [...localResults.violations, ...violations];
        localResults.passes = [...localResults.passes, ...passes];
        localResults.incomplete = [...localResults.incomplete, ...incomplete];
        localResults.inapplicable = [
          ...localResults.inapplicable,
          ...inapplicable,
        ];

        console.log('Violations: ');
        for (let j = 0; j < results.violations.length; j++) {
          const v = violations[j];
          v.url = URLS_TO_TEST[i];
          const firstTargetElement =
            v.nodes.length > 0 ? `- on element: ${v.nodes[0].target[0]}` : '';
          console.log(
            color[v.impact],
            `${v.impact} - ${v.id}: ${v.help} ${firstTargetElement}`,
            '\x1b[0m',
          );
        }

        analyzeLocal(callback, i + 1);
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
        }

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

        for (let j = 0; j < results.violations.length; j++) {
          const v = violations[j];
          v.url = URLS_TO_TEST[i];
        }

        analyzeBenchmark(callback, i + 1);
      });
    });
  } else {
    callback(null);
  }
};

const violationsAreEqual = (v1, v2) => {
  return v1.url === v2.url && v1.id === v2.id;
};

const wrapup = () => {
  console.timeEnd('Execution time');
  console.log('=== ACCESSIBILITY TESTS DONE ===');
  console.log(
    `violations in BENCHMARK: ${benchmarkResults.violations.length}, passes: ${benchmarkResults.passes.length}, incomplete: ${benchmarkResults.incomplete.length}, inapplicable: ${benchmarkResults.inapplicable.length}`,
  );
  console.log(
    `violations in LOCAL: ${localResults.violations.length}, passes: ${localResults.passes.length}, incomplete: ${localResults.incomplete.length}, inapplicable: ${localResults.inapplicable.length}`,
  );

  const newViolations = localResults.violations.filter(v1 => {
    return !benchmarkResults.violations.some(v2 => {
      return violationsAreEqual(v1, v2);
    });
  });

  if (newViolations.length > 0) {
    console.log('New Errors introduced: ');
    for (let j = 0; j < newViolations.length; j++) {
      const v = newViolations[j];
      const firstTargetElement =
        v.nodes.length > 0 ? `- on element: ${v.nodes[0].target[0]}` : '';
      console.log(
        color[v.impact],
        `${v.impact} - ${v.id}: ${v.help} ${firstTargetElement}`,
        '\x1b[0m',
      );
    }
  } else {
    console.log('No new erros');
  }
  driver1.quit();
  driver2.quit();
};

console.time('Execution time');
parallel(
  [
    callback => {
      analyzeLocal(callback, 0);
    },
    callback => {
      analyzeBenchmark(callback, 0);
    },
  ],
  err => {
    if (err) {
      console.error(err);
    }
    wrapup();
  },
);

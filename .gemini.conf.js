export const rootUrl = 'http://localhost:8080';
export const screenshotsDir = './test/visual-images/';
export const httpTimeout = 40000;
export const sessionRequestTimeout = 120000;
export const sessionsPerBrowser = 1;
export const suitesPerSession = 50;
export const retry = 10;
export const system = {
  plugins: {
    browserstack: { localIdentifier: process.env.IDENTIFIER },
    'html-reporter': { enabled: true },
  },
  parallelLimit: 3,
};
export const browsers = {
  ie11: {
    windowSize: '600x1024',
    desiredCapabilities: {
      os: 'Windows',
      os_version: '10',
      browserName: 'internet explorer',
      browser: 'IE',
      browser_version: '11',
      locationContextEnabled: false,
      'browserstack.timezone': 'Europe/Helsinki',
      'browserstack.video': false,
    },
  },
  chrome: {
    windowSize: '600x1024',
    desiredCapabilities: {
      os: 'Windows',
      os_version: '10',
      browserName: 'chrome',
      version: '70',
      locationContextEnabled: false,
      'browserstack.timezone': 'Europe/Helsinki',
      'browserstack.video': false,
    },
  },
  safari11: {
    windowSize: '600x1024',
    desiredCapabilities: {
      os: 'OS X',
      os_version: 'High Sierra',
      browserName: 'safari',
      version: '11.1',
      locationContextEnabled: false,
      'browserstack.timezone': 'Europe/Helsinki',
      'browserstack.video': false,
    },
  },
  edge15: {
    windowSize: '600x1024',
    desiredCapabilities: {
      os: 'Windows',
      os_version: '10',
      browserName: 'edge',
      version: '15',
      locationContextEnabled: false,
      'browserstack.timezone': 'Europe/Helsinki',
      'browserstack.video': false,
    },
  },
  firefox: {
    windowSize: '600x1024',
    desiredCapabilities: {
      os: 'Windows',
      os_version: '10',
      browserName: 'firefox',
      version: '47',
      locationContextEnabled: false,
      'browserstack.timezone': 'Europe/Helsinki',
      'browserstack.video': false,
    },
  },
};

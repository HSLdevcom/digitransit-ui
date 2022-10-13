const { devices } = require('playwright');

const iPhone12 = devices['iPhone 12'];

module.exports = {
  serverOptions: {
    command: `CONFIG=${
      process.env.CONFIG || 'hsl'
    } NODE_OPTS=--max_old_space_size=1000 yarn start-test`,
    port: 8080,
    protocol: 'http',
    launchTimeout: 200000,
    debug: true,
    usedPortAction: 'ignore',
  },
  launchOptions: {
    headless: !process.env.DEBUG,
  },
  contextOptions: {
    viewport: iPhone12.viewport,
  },
  isMobile: true,
  devices: ['iPhone 12'],
  browsers: ['chromium'],
};

module.exports = {
  serverOptions: {
    command: `CONFIG=hsl yarn dev`,
    port: 8080,
    // If default or tcp, the test starts right await whereas the dev server is not available on http
    protocol: 'http',
    // In ms
    launchTimeout: 30000,
    debug: true,
    usedPortAction: 'ignore', // your test are executed, we assume that the server is already started
  },
  launchOptions: {
    headless: true,
    slowMo: process.env.SLOWMO ? process.env.SLOWMO : 0,
  },
  launchType: 'LAUNCH',
  contextOptions: {
    viewport: {
      width: 1360,
      height: 768,
    },
  },
  browsers: ['chromium', 'firefox', 'webkit'],
};

module.exports = {
  serverOptions: {
    command: `CONFIG=hsl yarn dev`,
    port: 8080,
    protocol: 'http',
    launchTimeout: 30000,
    debug: true,
    usedPortAction: 'ignore',
  },
  launchOptions: {
    headless: true,
  },
  browsers: ['chromium', 'firefox', 'webkit'],
};

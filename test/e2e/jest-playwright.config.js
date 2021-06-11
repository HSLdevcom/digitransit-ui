module.exports = {
  serverOptions: {
    command: `CONFIG=hsl yarn dev-nowatch`,
    port: 8080,
    launchTimeout: 200000,
    debug: true,
    usedPortAction: 'ignore',
  },
  launchOptions: {
    headless: true,
  },
  browsers: ['chromium', 'firefox', 'webkit'],
};

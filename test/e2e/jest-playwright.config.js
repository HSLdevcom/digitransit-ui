module.exports = {
  serverOptions: {
    command: `CONFIG=${
      process.env.CONFIG || 'hsl'
    } CHOKIDAR_USEPOLLING=1 yarn dev-nowatch`,
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

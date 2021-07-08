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
    headless: true,
  },
  contextOptions: {
    viewport: {
      width: 390,
      height: 844,
    },
  },
  isMobile: true,
  devices: ['iPhone 12'],
  browsers: ['chromium', 'webkit'],
};

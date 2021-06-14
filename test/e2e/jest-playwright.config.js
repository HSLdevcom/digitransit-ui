module.exports = {
  serverOptions: {
    command: `CONFIG=${
      process.env.CONFIG || 'hsl'
    } NODE_OPTS=--max_old_space_size=1000 yarn start`,
    port: 8080,
    protocol: 'http',
    launchTimeout: 200000,
    debug: true,
    usedPortAction: 'ignore',
  },
  launchOptions: {
    headless: true,
  },
  browsers: ['chromium', 'firefox', 'webkit'],
};

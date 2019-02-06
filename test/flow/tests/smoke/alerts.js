module.exports = {
  '@tags': ['smoke'],
  'User should be able to click the alerts icon': browser => {
    const alertIcon = '.navi-icons > a .icon';
    browser.url(browser.launch_url);
    browser.waitForElementVisible(
      alertIcon,
      browser.globals.elementVisibleTimeout,
    );
    browser.click(alertIcon);
    browser.end();
  },
};

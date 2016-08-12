function clickMenuToggle() {
  return this.click('@mainMenuToggle');
}

function openAbout() {
  this.click('#about');
}

module.exports = {
  commands: [{
    clickMenuToggle,
    openAbout,
  }],
  elements: {
    mainMenuToggle: '.main-menu-toggle',
  },
};

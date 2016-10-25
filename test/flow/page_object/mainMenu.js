function clickMenuToggle() {
  this.api.debug('clicking menu toggle');
  return this.click('@mainMenuToggle', result => {
    this.assert.equal(result.status, 0);
  });
}

function clickSelectEnglish() {
  this.api.debug('selecting english language');
  return this.click('@langEn', result => {
    this.assert.equal(result.status, 0);
  });
}

function openAbout() {
  this.api.debug('clicking about');
  this.click('#about', result => {
    this.assert.equal(result.status, 0);
  });
}

module.exports = {
  commands: [{
    clickMenuToggle,
    clickSelectEnglish,
    openAbout,
  }],
  elements: {
    mainMenuToggle: '.main-menu-toggle',
    langEn: '#lang-en',
  },
};

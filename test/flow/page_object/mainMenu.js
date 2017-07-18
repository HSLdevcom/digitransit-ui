function clickMenuToggle() {
  this.api.debug('clicking menu toggle');
  return this.api.checkedClick(this.elements.mainMenuToggle.selector);
}

function clickSelectEnglish() {
  this.api.debug('selecting english language');
  return this.api.checkedClick(this.elements.langEn.selector);
}

function openAbout() {
  this.api.debug('clicking about');
  this.api.checkedClick(this.elements.about.selector);
}

module.exports = {
  commands: [
    {
      clickMenuToggle,
      clickSelectEnglish,
      openAbout,
    },
  ],
  elements: {
    mainMenuToggle: '.main-menu-toggle',
    langEn: '#lang-en',
    about: '#about',
  },
};

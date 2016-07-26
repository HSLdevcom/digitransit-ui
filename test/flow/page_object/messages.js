function clickMessagebarClose() {
  return this.click('@close');
}

module.exports = {
  commands: [{ clickMessagebarClose }],
  elements: {
    close: '.close-button .close',
  },
};

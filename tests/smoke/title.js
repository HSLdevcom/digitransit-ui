module.exports = {
  'title' : function (browser) {
    browser
      .url('http://test.rutebanken.org')
      .assert.title("Rutebanken");
  }
};

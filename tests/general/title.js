module.exports = {
  'title' : function (browser) {
    browser
      .url('http://test.rutebanken.org')
      .waitForElementVisible('body', 1000)
      .getTitle(function(result) {
        console.log("Hei");
        this.assert.equal(typeof result, 'string');
        this.assert.equal(result.value, 'Rutebanken');
      })
      .end();

  }
};

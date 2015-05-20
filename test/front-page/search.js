var TEST_NAME = "Front page - Search"
var webdriver = require('selenium-webdriver')
var constants = require('../constants')
var By = webdriver.By
var Until = webdriver.until
var Driver = require('../driver')
var driver

var BASE_URL = constants.BASE_URL
var TIMEOUT =  constants.TIMEOUT

before(function() {
  driver = Driver(TEST_NAME)  
  return driver.get(BASE_URL)
})

after(function(done) {
  return driver.quit().then(function(){
    done()
  })
})

describe(TEST_NAME, function() {
  it('Should find "Sampsantie, helsinki" street hit by "sampsan"', function(done) {
    driver.wait(Until.elementLocated(By.id("autosuggest")), TIMEOUT).then(function(autosuggest) {
      driver.wait(Until.elementIsEnabled(autosuggest), TIMEOUT).then(function() {
        autosuggest.sendKeys("sampsan")
      })
    })

    driver.wait(Until.elementLocated(By.id("Sampsantie, helsinki")), TIMEOUT).then(function(sampsantie) {
      sampsantie.click()  
    }).then(function() {
      done()
    })
  })

  it('Should find "Sampsantie 20, Helsinki" address hit by partial address "sampsant"')
  it('Should find "Sampsantie 20, Helsinki" address hit by full address "sampsantie 20"')
  it('Should find both "Kirkkotie, Espoo" and "Kirkkotie, Vantaa" by "kirkkotie"')
  it('Should find addresses for both "Kirkkotie, Espoo" and "Kirkkotie, Vantaa" by "kirkkotie 1"')
  it('Should scroll search div when search results are scrolled with arrow keys')
})
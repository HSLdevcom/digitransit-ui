var TEST_NAME = "Front page - Map"
var webdriver = require('selenium-webdriver')
var constants = require('../constants')
var Driver = require('../driver')
var By = webdriver.By
var Until = webdriver.until

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
  it('Map should exist', function(done) {
    driver.wait(Until.elementLocated(By.id("map1")), TIMEOUT).then(function(map) {
      done()
    })
  })
})

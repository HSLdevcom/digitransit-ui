TEST_NAME = "Stop page"
webdriver = require 'selenium-webdriver'
constants = require '../constants'
Driver    = require '../driver'
By        = webdriver.By
Until     = webdriver.until
driver    = null

BASE_URL = constants.BASE_URL
TIMEOUT =  constants.TIMEOUT

before () ->
  driver = Driver(TEST_NAME)  
  return driver.get(BASE_URL + "/pysakit/HSL:1173210")

after (done) -> 
  return driver.quit().then () ->
    done()

describe TEST_NAME, () ->
  it 'Should have map', (done) ->
    driver.wait(Until.elementLocated(By.id("map1")), TIMEOUT).then (map) ->
      done()


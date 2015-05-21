TEST_NAME = "Front page - Map"
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
  return driver.get(BASE_URL)

after (done) -> 
  return driver.quit().then () ->
    done()

describe TEST_NAME, () ->
  it 'Should be visible', (done) ->
    driver.wait(Until.elementLocated(By.id("map1")), TIMEOUT).then (map) ->
      done()

  it "Should display user's location if available"
  it 'Should display stops that fit to map'
  it 'Should not be zoomable or pannable'  
  it 'Should be enlarged to fullscreen when any part of small map is clicked'  

TEST_NAME = "Fullscreen map page"
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
  return driver.get(BASE_URL + "/kartta")

after (done) -> 
  return driver.quit().then () ->
    done()

describe TEST_NAME, () ->
  it 'Should be visible', (done) ->
    driver.wait(Until.elementLocated(By.id("map1")), TIMEOUT).then (map) ->
      done()

  it 'Should be zoomable and pannable'
  it 'Should be minimized when icon is clicked and return to previous page'
  it 'Should show stop popup when stop icon is clicked'
  it 'Should show favourited stop with colored star in stop popup'
  it 'Should add stop to favourite when star icon is clicked'

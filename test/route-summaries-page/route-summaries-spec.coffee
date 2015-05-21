TEST_NAME = "Route summaries page"
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
  return driver.get(BASE_URL + "/reitti/Ratamestarinkatu%206::60.199169100000006,24.9396319/Helenankuja,%20Vantaa::60.32684968699131,25.072526641556877")

after (done) -> 
  return driver.quit().then () ->
    done()

describe TEST_NAME, () ->
  it 'Should have route map', (done) ->
    driver.wait(Until.elementLocated(By.id("map1")), TIMEOUT).then (map) ->
      done()

  it 'Should have to and from fields prefilled'
  it 'Should display 3 route summaries'
  it 'Should have back button that takes user to previous page'
  it 'Should have configure button that opens right offcanvas'


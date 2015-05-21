TEST_NAME = "Front page - Search"
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
  it 'Should find "Sampsantie, helsinki" street hit by "sampsan"', (done) ->
    driver.wait(Until.elementLocated(By.id("autosuggest")), TIMEOUT).then (autosuggest) ->
      driver.wait(Until.elementIsEnabled(autosuggest), TIMEOUT).then () ->
        autosuggest.sendKeys("sampsan")

    driver.wait(Until.elementLocated(By.id("Sampsantie, helsinki")), TIMEOUT).then (sampsantie) ->
      sampsantie.click()  
    .then () ->
      done() 

  it 'Should find "Sampsantie 20, Helsinki" address hit by partial address "sampsant"'
  it 'Should find "Sampsantie 20, Helsinki" address hit by full address "sampsantie 20"'
  it 'Should find both "Kirkkotie, Espoo" and "Kirkkotie, Vantaa" by "kirkkotie"'
  it 'Should find addresses for both "Kirkkotie, Espoo" and "Kirkkotie, Vantaa" by "kirkkotie 1"'
  it 'Should scroll search div when search results are scrolled with arrow keys'
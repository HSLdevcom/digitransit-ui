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

    driver.wait(Until.elementLocated(By.id("Sampsantie, Helsinki")), TIMEOUT).then (sampsantie) ->
      sampsantie.click()  
    .then () ->
      done() 

  it 'Should find "Osmonkuja 1, Helsinki" address hit by partial address "osmonku" when only one street is found'
  it 'Should find "Immonkuja, Vantaa" address hit by partial middle address "mmonkuj"'
  it 'Should find "Sampsantie 20, Helsinki" address hit by typing full address "sampsantie 20"'
  it 'Should select "Sampsantie 20, Helsinki" address when user types "Sampsantie 20, Helsinki" presses enter without moving arrow keys'
  it 'Should find "Sampsantie 20, Helsinki" address hit by copy-pasting value "sampsantie 20" to input field'
  it 'Should find both "Kirkkotie, Vantaa" and "Kirkkotie, Kauniaianen" by "kirkkotie"'
  it 'Should find address numbers for both "Kirkkotie, Espoo" and "Kirkkotie, Vantaa" by "kirkkotie 1"'
  it 'Should scroll search div when search results are scrolled using arrow keys'
  it 'Should find "Klovi (E2431), Espoo" stop by "e2431"'
  it 'Should use and show "Immonkuja 1, Vantaa" when "Immonkuja, Vantaa" is selected from autosuggest'
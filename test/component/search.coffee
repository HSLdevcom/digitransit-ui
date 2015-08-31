TEST_NAME = "Search"
webdriver = require 'selenium-webdriver'
constants = require '../constants'
Driver    = require '../driver'
By        = webdriver.By
Until     = webdriver.until
driver    = null

BASE_URL = constants.BASE_URL
TIMEOUT =  constants.TIMEOUT

describe TEST_NAME, () ->
  describe "general functionality"
    it 'Should support switching from and to location'
    it 'Should store from and to location as application state and initialize values from that state'    

  describe "Routing logic"
    it "Should perform routing automatically when from and to location become set"
    it "Should perform routing when 'magnifying class' is pressed if from and to location is set"
    it "Should use user's latest Position coordinates from geolocation for 'Your position'"
    it "Should use address geolocation if address is typed as input value"

  describe "Search logic"
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

  describe "From Location functionality"
    describe "Based on Position status"
      describe "No location"
        it "Should have 'start positioning' and 'write from location' functionality available"

      describe "Previous position"
        it "Should have 'start positioning' and 'write from location' functionality available"

      describe "Positioning"
        it "Should show 'positioning' text and disable writing to input field"
        it "Should support aborting of positioning. Aborting should happen immediately."

      describe "Tracking position"
        it "Should show 'Your position' text"
        it "Should allow clearing from location"

      describe "Previous position"
        it "Should have 'start positioning' and 'write from location' functionality available"
      
      describe "Positioning timeout"
        it "Should have 'try positioning again' and 'write from location' functionality available"

      describe "Positioning aborted"
        it "Should have 'start positioning' and 'write from location' functionality available"

      describe "Positioning not supported"
        it "Should only show 'write from location' text"

      describe "Positioning denied"
        it "Should only show 'write from location' text"
  
  describe "To Location functionality"
    it "Should have 'write to location' functionality available"
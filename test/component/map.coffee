TEST_NAME = "Map"
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
    it 'Should be pannable and zoomable if not explicitly denied by use case'
    it 'Should not show loader except when explicitly denied by use case'
    it 'Should have +/- zoom icons on desktop only'
    it 'Should have "tracking mode" botton available'

  describe "properties"
    it 'Should hilight stop when given'
    it 'Should include "Tracking mode" icon when given'
    it 'Should include stops layer when given'
    it 'Should include vehicles layer when given'

  describe "Functionality based on Position"
    describe "No position"
      it 'Should be centered to Helsinki city center'

    describe "Previous position"
      it 'Should be centered to previous position'
      it 'Should disable "tracking mode"'

    describe "Positioning"
      it 'Should show loader on top of map'
      it 'Should be fixed to current area, no zooming or panning shall be possible'

    describe "Tracking position"
      it 'Should automatically enable "tracking mode"'
      it 'Should draw user position on map'
      it 'Should follow user by panning map when "tracking mode" is turned on'
      it 'Should turn "tracking mode" off when map is panned'
    
    describe "Positioning timeout"
      it "Should keep showing user's previous position if available"
      it "Should work like 'No position' if previous position is not available"

    describe "Positioning aborted"
      it "Should keep showing user's previous position"
      it "Should work like 'No position' if previous position is not available"

    describe "Positioning not supported"
      it "Should keep showing user's previous position"
      it "Should work like 'No position' if previous position is not available"

    describe "Positioning denied"
      it "Should keep showing user's previous position"
      it "Should work like 'No position' if previous position is not available"

  describe "Functionality based on Location"
    describe "No Location"
      it 'Should show Position marker on previous position coordinates if available'

    describe "From Location set"
      it "Should show 'user's Position marker' when Position state is 'Tracking position'"
      it "Should show 'from location marker' when Position state is something else than 'Tracking position'"

    describe "To Location set"
      it "Should show 'to location marker'"

    describe "Route set"
      it 'Should show selected route on map'
      it 'Should show from and to markers'

    describe "Route via point set"
      it "Should show selected route via point on map
      it 'Should show from, to, and via markers'

  describe "Functionality based on icon clicks"
    describe "Stop"
      it 'Should show stop information'

    describe "Vehicle"
      it 'Should show stop information'

    describe "Terminal"
      it 'TODO?'

    describe "Kiss and ride"
      it 'TODO?'

    describe "Bike park"
      it 'TODO?'
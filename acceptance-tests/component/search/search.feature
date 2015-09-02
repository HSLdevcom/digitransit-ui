Feature: Search component

  Scenario: Routing should be done when both From and To fields become populated
    Given That user has entered From or To value
    When User enters missing Location
    Then Routing should be performed

  Scenario: From and To location switch
    When user clicks on "switch" button
    Then From and To location should be switched 

  Scenario: From and To values should be initialized to values set previously during the session
    Given User has set From or To location
    When User goes to page that has search available
    Then Values should be initialized from session data

  Scenario: Routing should be done on 'magnifying glass' click
    Given That user has entered From and To values
    When User clicks on 'magnifying glass'
    Then Routing should be performed

  Scenario: Routing uses user's current location
    Given From location is 'My location'
    When routing is performed
    Then current position right now from Geolocation should be used as value

  Scenario: Position is not possible when position status is 'Position not supported' or 'Positioning denied'
    Given Geolocation error has occured
    When Position status is 'Position not supported' or 'Positioning denied'
    Then It should not be possible to retry positioning

  Scenario: Position retry
    Given Geolocation error has occured
    When Position status is 'Position aborted' or 'Positioning timout'
    Then It should be possible to retry positioning

  Scenario: Abort geolocation positioning
    Given Position status is 'Positioning'
    When User clicks to abort geolocationing
    Then Search input should be immediately available for writing

  Scenario: Search dropdown selections should include previous searches
    Given User has previous searches
    When search input is activated
    Then Old searches should be available for selection

  Scenario: Selecting value from search dropdown
    Given There are values available in search dropdown
    When value is selected
    Then Selected values should be immediately picked into input

  Scenario: Automatically focus destination
    Given User is on desktop
    And User is setting from location value
    And There is no to location set
    When From location value is selected
    Then input focus should be automatically transferred to To Location input

  Scenario: Enter press should select unique address
    Given User is trying to set from or to location
    When User types 'Salomonkatu 2'
    And presses enter
    Then 'Salomonkatu 2, Helsinki' should be selected because it's the only hit available

  Scenario: Fuzzy results should be used
    Given User is trying to set from or to location
    When User types value that results in fuzzy match hit
    And presses enter
    Then Selection should work as with 'Non fuzzy' matches

  Scenario: Enter press should select closest hits to the user when multiple hits are found
    Given User is trying to set from or to location
    And user's Position is in Vantaa
    When User types 'Kirkkotie 2'
    And presses enter
    And Geocoding resolves 'Kirkkotie 2' from 'Vantaa' and 'Kauniainen'
    Then "Kirkkotie 2, Vantaa" should be selected because it's the closest one

  Scenario: Enter press should select first hit when multiple hits are available and user's location is not known
    Given User is trying to set from or to location
    And user's Position is unknown
    When User types 'Kirkkotie 2'
    And presses enter
    And Geocoding resolves 'Kirkkotie 2' from 'Vantaa' and 'Kauniainen'
    Then "Kirkkotie 2, Kauniainen" should be selected because it's the first hit

  Scenario: Search with non existing number
    Given User is trying to set from or to location
    When User types address number that is not availabe like 'Sampsantie 100'
    And presses enter
    Then Selection should work as with existing number matches

  Scenario: Search with other language
    Given User is using Finnish version
    When User types 'Mannerheimvägen'
    Then 'Mannerheimintie' should be found

  Scenario: Search results ordering
    Given User has reveived search results of multiple type
    When Search results are shown
    Then Order should be 1. address, 2. stop, 3. POI

  Scenario: City name is easily used in search
    Given User is trying to set from or to location
    When value is 'Sampsantie helsinki' or 'Sampsantie, helsinki'
    Then "Sampsantie, Helsinki" should be found

  Scenario: Address search works without address number
    Given User is trying to set from or to location
    When value is 'Sampsantie' typed
    And Enter is pressed
    Then "Sampsantie 2, Helsinki" should be used because it's smallest number

  Scenario: Address search works without address number on street that has no numbers
    Given User is trying to set from or to location
    When user types street name that has no numbers
    And Enter is pressed
    Then Street center should be used as coordinates
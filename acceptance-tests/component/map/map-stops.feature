Feature: Map component show stops

  Scenario: Stops are shown on map
    Given Stops are selected to be drawn on map
    When Zoom level is 15 or above
    Then stops should be shown on map

  Scenario: Click on Stop
    Given Map is not locked
    When User clicks on Stop icon
    Then Stop bubble should be shown
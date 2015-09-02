Feature: Map component show vehicles

  Scenario: Vehicles are shown on map
    Given Vehicles are selected to be drawn on map
    When Zoom level is 16 or above
    Then vehicles should be shown on map

  Scenario: Click on Vehicle
    Given Map is not locked
    When User clicks on Vechicle icon
    Then Vechicle bubble should be shown
Feature: Map component show street names

  Scenario: Street names are shown on map
    Given Map is mounted on page
    When user moves map
    Then street names should be visible
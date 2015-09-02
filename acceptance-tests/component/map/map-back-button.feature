Feature: Map component reloads after back button

  Scenario: User moves forward by clicking something in "Map bubble" and then back to map
    Given User clicks e.g. "Show departures" and moves to Stop page
    When Clicks on back button on Stop page
    Then Map should remain in same position as it was 
    And Stop bubble should remain open
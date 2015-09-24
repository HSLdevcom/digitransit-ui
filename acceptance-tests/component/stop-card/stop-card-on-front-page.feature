Feature: Stop on front page

  Scenario: Show nearby stops
    Given User has set Origin location
    When Nearby stops tab is opened
    Then Nearby stops should be shown starting from the closest one to Origin location

  Scenario: Search nearby stops
    Given Nearby stops tab is active
    When User types at least 2 characters
    Then UI should show stops starting with typed characters

  Scenario: Search nearby stops and select one
    Given User has done nearby stops search
    When User selects one option
    Then User should be transition to stop page

  Scenario: Show message if Origin location is not set
    Given Origin location is not set
    When Nearby stops tab is opened
    Then Message about "Set you location" should be shown
Feature: Nearby trips

  Scenario: Show nearby trips
    Given User has set Origin location
    When Nearby trips tab is opened
    Then Nearby trips should be shown starting from the Origin location
    And Nearby trips should be grouped -100m, 100m-200m, 200m-500m
    And Trips that are further than 500m away should not be shown
    And One route should be shown only once

  Scenario: Search nearby trips
    Given Nearby trips is active
    When User types at least 1 characters 
    Then UI should show all trips that start with given text

  Scenario: Search Nearby trip and select one
    Given User has done Nearby trips search
    When User selects one option
    Then User should be transition to trip page

  Scenario: Search Nearby trip and select stop where trip starts from
    Given User has done Nearby trips search
    When User selects one trip by clicking stop number
    Then User should be transition to stop page

  Scenario: Search nearby routes
    Given Nearby trips is active
    When User types at least 1 characters 
    Then UI should show all routes that start with given text

  Scenario: Search Nearby routes and select one
    Given User has done Nearby routes search
    When User selects one option
    Then User should be transition to route page

  Scenario: Show message if Origin location is not set
    Given Origin location is not set
    When Nearby trips tab is opened
    Then Message about "Set you location" should be shown
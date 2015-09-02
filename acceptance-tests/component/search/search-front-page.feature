Feature: Search component on front page

  Scenario: 
    Given That From location is being resolved by the browser
    And To location is set before geolocation is resolved
    When current position is found
    Then From location should be set to 'My position'
    And Routing should not be automatically performed

  Scenario: 
    Given That From location is 'My position'
    And To location is set
    When current position is updated
    Then Nothing special should happen
Feature: Search component on Summary page

  Scenario: 
    Given That From location is set as 'My position'
    When 'My position' has been fixed some minutes ago
    And Users position has changed since
    And 'Magnifying glass' is clicked
    Then Latest geolocation value should be used as 'My position'

  Scenario: 
    Given That From location is set as 'My position'
    When 'My position' has been fixed some minutes ago
    And Users position has changed since
    And 'Switch' is clicked
    Then Latest geolocation value should be used as 'My position'

  Scenario: 
    Given That From location is set as 'My position'
    When 'My position' has been fixed some minutes ago
    And Users position has changed since
    And Page is refreshed
    Then Latest geolocation value should be used as 'My position'

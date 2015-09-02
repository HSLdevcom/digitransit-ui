Feature: Application should use HTML5 geolocation

  Scenario: Enabling geolocation tracking
    Given Application loads
    When Position status is 'No Location' or 'Previous position'
    Then geolocation watchposition should be started
    And Position status should be set to 'Positioning'

  Scenario: User aborts geolocation lookup
    Given Position status in 'Positioning'
    When User aborts geolocation lookup
    And Current position should remain as it is
    And From location should be set empty
    And Location status should be set to 'No location set'
    Then Position status should be set to 'Positioning aborted'

  Scenario: Received geolocation
    Given User has not aborted geolocationing
    When geolocation callback is called
    Then Current Position coordinates should be stored
    And From location should be set as 'Your position'
    And Location status should be set to 'From location set'
    And Position status should be set to 'Tracking position'
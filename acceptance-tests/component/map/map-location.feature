Feature: Map component reacts to Location changes

  Scenario: Location status becomes 'No Location'
    Given Map is mounted on page
    And Previous position coordinates are available
    When Location status becomes 'No Location'
    Then Position marker should be shown on Previous position

  Scenario: Location status becomes 'From Location set' while tracking position
    Given Map is mounted on page
    And Position status is 'Tracking position'
    When Location status becomes 'From location set'
    Then User's position marker should be shown

  Scenario: Location status becomes 'From Location set' while not tracking position
    Given Map is mounted on page
    And Position status is something else than 'Tracking position'
    When Location status becomes 'From location set'
    Then Map pans to the set location
    And from location marker (blue droplet) should be shown at the set location
    And the position marker (white-blue circle) is still shown if it's in map bounds

  Scenario: Location status becomes 'Route set'
    Given Map is being mounted on Summary page
    When Location status is 'Route set'
    Then From and To Location markers should be drawn
    And all available routes should be drawn on map
    And selected route should be hilighted

  Scenario: Location status becomes 'Route via point set'
    Given Map is being mounted on Summary page
    When Location status is 'Route set'
    Then From, To, and via Location markers should be drawn
    And all available routes should be drawn on map
    And selected route should be hilighted

Feature: Map component reacts to Position change

  Scenario: Position status becomes 'No position'
    Given Map is mounted on page
    When Position status becomes 'No position'
    Then Map should be centered to Helsinki city center
    And Map should be pannable and zoomable

  Scenario: Position status becomes 'Previous position'
    Given Map is mounted on page
    When Position status becomes 'Previous position'
    Then Map should be centered to previous position
    And Traking mode should be disabled

  Scenario: Position status becomes 'Positioning'
    Given Map is mounted on page
    When Position status becomes 'Positioning'
    Then Positioning overlay should be shown
    And Map should be locked in place
    And Zoom buttons should be disabled

  Scenario: Position status becomes 'Tracking position'
    Given Map is mounted on page
    When Position status becomes 'Tracking position'
    Then User's location should be displayed
    And Positioning overlay' should be hidden
    And Tracking mode should be enabled

  Scenario: Position status becomes 'Previous position'
    Given Map is mounted on page
    When Position status becomes 'Previous position'
    Then User's location should be freezed where it is
    And 'Positioning overlay' should be hidden

  Scenario: Error occurs and previous position is available
    Given Map is mounted on page
    And User's previous position is available
    When Position error occurs
    Then User's old position should be used

  Scenario: Error occurs and previous position is NOT available
    Given Map is mounted on page
    And User's previous position is not available
    When Position error occurs
    Then Functionality should be like "No position"

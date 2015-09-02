Feature: Map component tracking mode
  
  Scenario: Enabling Position tracking mode
    Given Position tracking becomes enabled
    Then Map should follow user's position
    And 'Tracking mode' icon should be 'lighted'

  Scenario: Disabling Position tracking mode
    Given Position tracking becomes disabled
    Then Map should not follow user's position
    And 'Tracking mode' icon should be 'grayed'

  Scenario: Tracking is toggled by button
    Given Tracking mode is selected to be shown
    When User clicks tracking mode button
    Then Tracking mode should be toggled on or off

  Scenario: Tracking is disabled by panning
    Given Tracking mode is on
    When User panns map
    Then Tracking mode should be disabled


    
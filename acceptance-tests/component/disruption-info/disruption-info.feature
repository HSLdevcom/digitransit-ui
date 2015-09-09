Feature: Disruption info component

  Scenario: Show disruption info when available
    Given Disruption info has been loaded
    When There are disruption information
    Then Click on Disruption info icon should open dialog

  Scenario: Don't show disruption info when not available
    Given Disruption info has been loaded
    When There is no disruption information
    Then Disruption info icon should stay 'grayed' and dialog cannot be opened
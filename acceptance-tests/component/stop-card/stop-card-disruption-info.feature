Feature: Stop card shows disruption info

  Scenario: Show disruption info when available
    Given Disruption info has been loaded
    When There is disruption info regarding route
    Then All route trips should be enhanced with disruption info highlight
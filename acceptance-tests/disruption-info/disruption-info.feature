Feature: Application fetch disruption info

  Scenario: Load disruption info
    Given Application loads
    When JavaScript has loaded
    Then Disruption information should be loaded
    And Stored for later use
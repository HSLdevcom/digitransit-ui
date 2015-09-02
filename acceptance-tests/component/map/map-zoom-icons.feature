Feature: Map component zoom icons

  Scenario: Zoom icons are needed on desktop
    Given User uses desktop
    When Map is mounted on page
    Then Zoom icons should be visible

  Scenario: Zoom icons are not used on mobile devices
    Given User uses any mobile device
    When Map is mounted on page
    Then Zoom icons should not be displayed
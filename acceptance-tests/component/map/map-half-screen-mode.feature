Feature: Map component in "half screen mode"

  Scenario: Map controls are disabled in "half screen mode"
    Given Map is placed on page in "half screen mode"
    Then Panning, zooming, clicking should not be possible
    And Zoom buttons should be hidden

  Scenario: Map opens to fullscreen when clicked
    Given Map is placed on page in "half screen mode"
    When User clicks on map
    Then Map should be opened to fullscreen
    And Panning, zooming, and clicking will become possible
    
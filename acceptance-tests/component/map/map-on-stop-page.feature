Feature: Map component on stop page

  Scenario: On stop page map should be zoomed in
    Given Map is on stop page
    When Map is shown
    Then zoom level should be 19
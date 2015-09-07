Feature: Map component should be zoomed in when placed on stop page

  Scenario: On stop page map should be zoomed in
    Given Map is on stop page
    When Map is shown
    Then zoom level should be 19
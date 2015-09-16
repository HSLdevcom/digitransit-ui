Feature: Map component shows Route

  Scenario: Route is shown on map with large stop icons
    Given Route is displayed on map
    When Zoom level is 15 or above
    Then Route stops should be 'large icons'
    
  Scenario: Route is shown on map with small stop icons
    Given Route is displayed on map
    When Zoom level is below 15 
    Then Route stops should be 'small icons'

  Scenario: Map shows vehicles only for selected route
    Given Route is displayed on map
    Then Only vehicles on selected route should be displayed

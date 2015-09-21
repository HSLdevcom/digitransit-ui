Feature: Customize Search feature

  Scenario: Customize Search visibility (show)
    Given That user has entered From and To values
    And is on the route page
    When the user clicks the "customize menu"-icon
    Then Customize Search offcanvas will be visible

  Scenario: Customize Search Visibility (hide)
    Given That user has opened the Customize Search offcanvas
    When the user clicks the "customize menu-icon"
    Or outside the offcanvas
    Then the Customize Search offcanvas will hide

  Scenario: Open Customize Search For The First Time
    Given That user has opened the Customize Search offcanvas for the first time
    Then all route options are checked
    And walking option is checked
    And sliders are in the middle
    And no accessibility nor ticket areas are selected

  Scenario: Itinerary Change Process (route option)
    Given That user changes any of the route options
    Then the itinerary updates automatically
    And suggest itinerary without that particular form of route

  Scenario: Itinerary Change Process (other)
    Given That user changes any value of the sliders or dropdown menus
    Then the itinerary updates automatically
    And changes have been taken into account in the new itinerary suggestions

  Scenario: Option Restrictions
    Given That user has selected all/any or none route option
    Then one option is always selected in second row (walk, bicycle, car)

  Scenario: No Itineraries Found
    Given that user has customized the itinerary
    When no itineraries can be found
    Then this is notified to the user

  Scenario: Loading
    Given That user has customized the itinerary
    When on poor internet connection
    Then a loading indicator is shown to the user

  Scenario: All Route Options Are Deselected (walk)
    Given That user has deselected all route options
    And walking option is checked
    Then itineraries suitable for walking should be given

  Scenario: All Transfer Options Are Deselected (bicycle)
    Given That user has deselected all route options
    And bicycle option is checked
    Then itineraries suitable for bicycle should be given

  Scenario: All Transfer Options Are Deselected (car)
    Given That user has deselected all route options
    And car option is checked
    Then itineraries suitable for car should be given

  Scenario: Providing With Suggestions
    When user start type something in the input-fields
    Then a list of suggestions should appear under the input-field
    And user can choose any suggestion to populate the field

  Scenario: Add Preferable Route
    Given That user has typed a valid route number in the "preferable route"-field
    When user clicks on the "plus"-icon
    Then itinerary changes automatically
    And the preferable route(s) are taken into account

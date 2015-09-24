Feature: Stop card shows trips from multiple service days

  Scenario: Show trips from multiple service days
    Given Stop card is on to be placed on page
    When we notice that it would remain empty because of service day break
    Then Trips from multiple service days should be combined to stop card
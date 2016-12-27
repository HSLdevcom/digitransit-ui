/* global gemini */


/**
 * Customizable test function
 * @skip browsers to skip
 * @componentName the component name to test
 * @variationName variation name
 * @aptureOrExampleNumber example number (index starts from 1) or array of
 *   selectors for capture-elements
 * @ignoreElements ignore ignoreElements selector (string) or selectors (Array of string)
 * @fn callback(actions, find) –  Optional callback describes a sequence of actions to bring the
 * page to this state, starting from a previous state of the suite.
**/
function testVariation(skip, componentName, variationName = 'normal', captureOrExampleNumber = 1,
  ignoreElements, fn = () => {}) {
  gemini.suite(`${componentName}_${variationName}`, (suite) => {
    if (skip) {
      suite.skip(skip);
    }

    try {
      let capture = `.component-example:nth-of-type(${captureOrExampleNumber}) .component`;
      if (captureOrExampleNumber instanceof Array) {
        capture = captureOrExampleNumber;
      }
      suite
      .setUrl(`/styleguide/component/${componentName}`)
      .setCaptureElements(capture)
      .ignoreElements(ignoreElements || [])
      .capture(variationName, {}, fn);
    } catch (error) {
      console.error('Error occurred while testing variation', variationName);
      throw error;
    }
  });
}

// tests//
testVariation('ie11', 'Departure', 'normal', 1, '.component-example:nth-of-type(1) .component .realtime-icon');
testVariation(undefined, 'Departure', 'added-padding', 2);
testVariation(undefined, 'Departure', 'with-stop', 3);
testVariation(undefined, 'Departure', 'isArrival', 4);

testVariation(undefined, 'DepartureTime', 'normal', 2);
testVariation(undefined, 'DepartureTime', 'canceled', 3);


testVariation(undefined, 'RouteNumber', 'normal');
testVariation(undefined, 'RouteNumber', 'vertical', 2);

testVariation(undefined, 'RouteDestination', 'normal');
testVariation(undefined, 'RouteDestination', 'isArrival', 2);


testVariation(undefined, 'Distance', 'zero');
testVariation(undefined, 'Distance', 'meters', 2);
testVariation(undefined, 'Distance', 'km', 3);

testVariation(undefined, 'PlatformNumber');

testVariation(undefined, 'CardHeader');
testVariation(undefined, 'Card');
testVariation(undefined, 'CityBikeCard');
testVariation(undefined, 'CityBikeContent');
testVariation(undefined, 'CityBikeAvailability');
testVariation(undefined, 'CityBikeUse');

testVariation(undefined, 'Availability');

testVariation(undefined, 'ParkAndRideAvailability', 'non-realtime');
testVariation(undefined, 'ParkAndRideAvailability', 'realtime', 2);

testVariation('ie11', 'FavouriteLocation', 'normal', 1,
      '.component-example:nth-of-type(1) .component .realtime-icon');

testVariation(undefined, 'EmptyFavouriteLocationSlot');

testVariation(undefined, 'TripRouteStop', 'non-realtime');
testVariation('ie11', 'TripRouteStop', 'realtime', [
  '.component-example:nth-of-type(2) .component',
], '.component-example:nth-of-type(2) .component svg.realtime');

testVariation(undefined, 'Favourite', 'normal');
testVariation(undefined, 'Favourite', 'hovered', 1, [], actions => actions.mouseMove(
      '.component-example:nth-of-type(1) .component svg'));
testVariation(undefined, 'Favourite', 'not-favourite', 2);
testVariation(undefined, 'Favourite', 'not-favourite-hovered', 2, [], actions => actions.mouseMove(
      '.component-example:nth-of-type(2) .component svg'));


testVariation(undefined, 'IconWithTail', 'normal');
testVariation(undefined, 'IconWithTail', 'rotate', 2);
testVariation(undefined, 'IconWithTail', 'class', 3);
testVariation(undefined, 'IconWithTail', 'notail', 4);

testVariation(undefined, 'SelectedIconWithTail');
testVariation(undefined, 'IconWithCaution');
testVariation(undefined, 'IconWithBigCaution');


testVariation(undefined, 'TimeNavigationButtons', 'normal');
testVariation(undefined, 'TimeNavigationButtons', 'hovered', 1, [], (actions) => {
  actions.mouseMove(
         // eslint-disable-next-line comma-dangle
        '.component-example:nth-of-type(1) .component button:first-of-type'
      ).wait(400); // Wait for animation to happen
});

testVariation(['ie11', 'safari10'], 'TimeSelectors'); // TODO figure out why time differs when run locally & snap

testVariation(undefined, 'RightOffcanvasToggle', 'default');
testVariation(undefined, 'RightOffcanvasToggle', 'adjusted', 2);

testVariation(undefined, 'MarkerSelectPopup');
testVariation(undefined, 'SelectStopRow');
testVariation(undefined, 'SelectTerminalRow');
testVariation(undefined, 'SelectCityBikeRow');
testVariation(undefined, 'SelectParkAndRideRow');
testVariation(undefined, 'TicketInformation');
testVariation(undefined, 'RouteScheduleDateSelect');
testVariation(undefined, 'RouteScheduleHeader');
testVariation(undefined, 'RouteScheduleStopSelect');
testVariation(undefined, 'RouteScheduleTripRow');

testVariation(undefined, 'AppBarSmall', 'with-back-arrow');
testVariation(undefined, 'AppBarSmall', 'without-back-arrow', 2);
testVariation(undefined, 'AppBarSmall', 'with-logo', 3);

testVariation(undefined, 'AppBarLarge');

testVariation(undefined, 'FakeSearchWithButton', 'basic');
testVariation(undefined, 'FakeSearchWithButton', 'large', 2);


testVariation(undefined, 'FrontPagePanelLarge');
testVariation(undefined, 'FrontPagePanelSmall');
testVariation(undefined, 'ExternalLink');
testVariation(undefined, 'LangSelect');

testVariation(undefined, 'ModeFilter', 'grey-buttons');
testVariation(undefined, 'ModeFilter', 'white-buttons', [
  '.nearby-routes .component-example:nth-of-type(1) .component',
]);


testVariation('ie11', 'RouteStop', 'normal', [
  '.component-example:nth-of-type(1) .component',
], '.component-example:nth-of-type(1) .component svg.realtime');


testVariation('ie11', 'DepartureRow', 'normal', 1, [
  '.component-example:nth-of-type(1) .component .realtime-icon',
]);

testVariation(undefined, 'DepartureRow', 'with-cancelation', 2);


testVariation(undefined, 'BicycleRentalStationRow', 'plenty-of-bikes');
testVariation(undefined, 'BicycleRentalStationRow', 'few-bikes', 2);
testVariation(undefined, 'BicycleRentalStationRow', 'no-bikes', 3);

testVariation(undefined, 'StopPageHeader');
testVariation(undefined, 'StopCardHeader');
testVariation(undefined, 'SplitBars');
testVariation(undefined, 'Labeled');
testVariation(undefined, 'Centered');
testVariation(undefined, 'InfoIcon');
testVariation(undefined, 'DepartureListHeader');
testVariation(undefined, 'NextDeparturesListHeader');
testVariation(undefined, 'SelectedStopPopupContent');
testVariation(undefined, 'PageFooter');

testVariation(undefined, 'FooterItem', 'basic');
testVariation(undefined, 'FooterItem', 'with-icon', 2);


testVariation(undefined, 'SummaryRow', 'passive');
testVariation(undefined, 'SummaryRow', 'active', 2);
testVariation(undefined, 'SummaryRow', 'open', 3);

testVariation(undefined, 'CurrentPositionSuggestionItem', 'with-position');
testVariation(undefined, 'CurrentPositionSuggestionItem', 'no-position', 2);

testVariation(undefined, 'SuggestionItem', 'Favourite');
testVariation(undefined, 'SuggestionItem', 'Address', 2);
testVariation(undefined, 'SuggestionItem', 'Route', 3);
testVariation(undefined, 'SuggestionItem', 'Stop', 4);

/* global gemini */


/**
 * Customizable test function
 * @theSuite the suite to use
 * @variationName variation name
 * @aptureOrExampleNumber example number (index starts from 1) or array of
 *   selectors for capture-elements
 * @ignoreElements ignore ignoreElements selector (string) or selectors (Array of string)
 * @fn callback(actions, find) –  Optional callback describes a sequence of actions to bring the
 * page to this state, starting from a previous state of the suite.
**/
function testVariation(theSuite, variationName, captureOrExampleNumber = 1,
  ignoreElements, fn = () => {}) {
  try {
    let capture = `.component-example:nth-of-type(${captureOrExampleNumber}) .component`;
    if (captureOrExampleNumber instanceof Array) {
      capture = captureOrExampleNumber;
    }
    theSuite
      .setCaptureElements(capture)
      .ignoreElements(ignoreElements || [])
      .capture(variationName, {}, fn);
  } catch (error) {
    console.error('Error occurred while testing variation', variationName);
    throw error;
  }
}

function test(componentName, suiteFn) {
  gemini.suite(componentName, (suite) => {
    suite.setUrl(`/styleguide/component/${componentName}`);
    suiteFn(suite);
  });
}

/**
 * The most basic test that compares the first example of a component.
 * Every component should be tested atleast this much.
 **/
function basicTest(componentName) {
  test(componentName, (suite) => {
    testVariation(suite, 'normal');
  });
}

gemini.suite('components', () => {
  test('Departure', (suite) => {
    testVariation(suite, 'normal', 1, '#Departure .component-example:nth-of-type(1) .component .realtime-icon');
    testVariation(suite, 'added-padding', 2);
    testVariation(suite, 'with-stop', 3);
    testVariation(suite, 'isArrival', 4);
  });

  test('DepartureTime', (suite) => {
    testVariation(suite, 'normal', 2);
    testVariation(suite, 'canceled', 3);
  });

  test('RouteNumber', (suite) => {
    testVariation(suite, 'normal');
    testVariation(suite, 'vertical', 2);
  });

  test('RouteDestination', (suite) => {
    testVariation(suite, 'normal');
    testVariation(suite, 'isArrival', 2);
  });

  test('Distance', (suite) => {
    testVariation(suite, 'zero');
    testVariation(suite, 'meters', 2);
    testVariation(suite, 'km', 2);
  });

  basicTest('PlatformNumber');

  basicTest('CardHeader');
  basicTest('Card');
  basicTest('CityBikeCard');
  basicTest('CityBikeContent');
  basicTest('CityBikeAvailability');
  basicTest('CityBikeUse');

  basicTest('Availability');

  test('ParkAndRideAvailability', (suite) => {
    testVariation(suite, 'non-realtime');
    testVariation(suite, 'realtime', 2);
  });

  test('FavouriteLocation', (suite) => {
    testVariation(suite, 'normal', 1,
      '#FavouriteLocation .component-example:nth-of-type(1) .component .realtime-icon');
  });

  basicTest('EmptyFavouriteLocationSlot');

  test('TripRouteStop', (suite) => {
    testVariation(suite, 'non-realtime');
    testVariation(suite, 'realtime', [
      '#TripRouteStop .component-example:nth-of-type(2) .component',
      '#TripRouteStop .component-example:nth-of-type(2) .component svg.realtime',
    ], '#TripRouteStop .component-example:nth-of-type(2) .component svg.realtime');
  });
  test('Favourite', (suite) => {
    testVariation(suite, 'normal');
    testVariation(suite, 'hovered', 1, [], actions => actions.mouseMove(
      '#Favourite .component-example:nth-of-type(1) .component svg'));
    testVariation(suite, 'not-favourite', 2);
    testVariation(suite, 'not-favourite-hovered', 2, [], actions => actions.mouseMove(
      '#Favourite .component-example:nth-of-type(2) .component svg'));
  });

  test('IconWithTail', (suite) => {
    testVariation(suite, 'normal');
    testVariation(suite, 'rotate', 2);
    testVariation(suite, 'class', 3);
    testVariation(suite, 'notail', 4);
  });

  basicTest('SelectedIconWithTail');
  basicTest('IconWithCaution');
  basicTest('IconWithBigCaution');


  test('TimeNavigationButtons', (suite) => {
    testVariation(suite, 'normal');
    testVariation(suite, 'hovered', 1, [], (actions) => {
      actions.mouseMove(
         // eslint-disable-next-line comma-dangle
        '#TimeNavigationButtons .component-example:nth-of-type(1) .component button:first-of-type'
      ).wait(400); // Wait for animation to happen
    });
  });

  basicTest('TimeSelectors');

  test('RightOffcanvasToggle', (suite) => {
    testVariation(suite, 'default');
    testVariation(suite, 'adjusted', 2);
  });

  basicTest('MarkerSelectPopup');
  basicTest('SelectStopRow');
  basicTest('SelectTerminalRow');
  basicTest('SelectCityBikeRow');
  basicTest('SelectParkAndRideRow');
  basicTest('TicketInformation');
  basicTest('RouteScheduleDateSelect');
  basicTest('RouteScheduleHeader');
  basicTest('RouteScheduleStopSelect');
  basicTest('RouteScheduleTripRow');

  test('AppBarSmall', (suite) => {
    testVariation(suite, 'with-back-arrow');
    testVariation(suite, 'without-back-arrow', 2);
    testVariation(suite, 'with-logo', 3);
  });

  basicTest('AppBarLarge');

  test('FakeSearchWithButton', (suite) => {
    testVariation(suite, 'basic');
    testVariation(suite, 'large', 2);
  });

  basicTest('FrontPagePanelLarge');
  basicTest('FrontPagePanelSmall');
  basicTest('ExternalLink');
  basicTest('LangSelect');

  test('ModeFilter', (suite) => {
    testVariation(suite, 'grey-buttons');
    testVariation(suite, 'white-buttons', ['.nearby-routes .component-example:nth-of-type(1) .component']);
  });

  test('RouteStop', (suite) => {
    testVariation(suite, 'normal', [
      '#RouteStop .component-example:nth-of-type(1) .component',
      '#RouteStop .component-example:nth-of-type(1) .component svg.realtime',
    ], '#RouteStop .component-example:nth-of-type(1) .component svg.realtime');
  });

  test('DepartureRow', (suite) => {
    testVariation(suite, 'normal', 1, [
      '#DepartureRow .component-example:nth-of-type(1) .component .realtime-icon',
    ]);

    testVariation(suite, 'with-cancelation', 2);
  });

  test('BicycleRentalStationRow', (suite) => {
    testVariation(suite, 'plenty-of-bikes');
    testVariation(suite, 'few-bikes', 2);
    testVariation(suite, 'no-bikes', 3);
  });

  basicTest('StopPageHeader');
  basicTest('StopCardHeader');
  basicTest('SplitBars');
  basicTest('Labeled');
  basicTest('Centered');
  basicTest('InfoIcon');
  basicTest('DepartureListHeader');
  basicTest('NextDeparturesListHeader');
  basicTest('SelectedStopPopupContent');
  basicTest('PageFooter');

  test('FooterItem', (suite) => {
    testVariation(suite, 'basic');
    testVariation(suite, 'with-icon', 2);
  });

  test('SummaryRow', (suite) => {
    testVariation(suite, 'passive');
    testVariation(suite, 'active', 2);
    testVariation(suite, 'open', 3);
  });

  test('CurrentPositionSuggestionItem', (suite) => {
    testVariation(suite, 'with-position');
    testVariation(suite, 'no-position', 2);
  });

  test('SuggestionItem', (suite) => {
    testVariation(suite, 'Favourite');
    testVariation(suite, 'Address', 2);
    testVariation(suite, 'Route', 3);
    testVariation(suite, 'Stop', 4);
  });
});

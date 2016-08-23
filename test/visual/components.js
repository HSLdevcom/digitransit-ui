/* global gemini */


/**
 * Customizable test function
 * @componentName component name as specified in styleguide to test
 * @aptureOrExampleNumber example number (index starts from 1) or array of
 *   selectors for capture-elements
 * @ignoreElements ignore ignoreElements selector (string) or selectors (Array of string)
 * @fn
**/
function test(componentName, captureOrExampleNumber, ignoreElements, fn = () => {}) {
  return function (suite) {
    try {
      let capture = `#${componentName} .component-example:nth-of-type(${captureOrExampleNumber
         || 1}) .component`;
      if (captureOrExampleNumber instanceof Array) {
        capture = captureOrExampleNumber;
      }
      suite
      .setUrl(`/styleguide/component/${componentName}`)
      .setCaptureElements(capture)
      .ignoreElements(ignoreElements || [])
      .capture('normal', {}, fn);
    } catch (error) {
      console.error(error);
    }
  };
}

/**
 * The most basic test that compares the first example of a component.
 * Every component should be tested atleast this much.
 **/
function basicTest(name) {
  gemini.suite(name, test(name));
}

gemini.suite('components', () => {
  gemini.suite('Departure', () => {
    gemini.suite('normal', test('Departure', 1,
      '#Departure .component-example:nth-of-type(1) .component .realtime-icon'));
    gemini.suite('added-padding', test('Departure', 2));
    gemini.suite('with-stop', test('Departure', 3));
    gemini.suite('isArrival', test('Departure', 4));
  });

  gemini.suite('DepartureTime', () => {
    gemini.suite('normal', test('DepartureTime', 2));
  });

  gemini.suite('RouteNumber', () => {
    gemini.suite('normal', test('RouteNumber'));
    gemini.suite('vertical', test('RouteNumber', 3));
  });
  gemini.suite('RouteDestination', () => {
    gemini.suite('normal', test('RouteDestination'));
    gemini.suite('isArrival', test('RouteDestination', 2));
  });

  gemini.suite('StopReference', test('StopReference'));

  gemini.suite('Distance', () => {
    gemini.suite('zero', test('Distance'));
    gemini.suite('meters', test('Distance', 2));
    gemini.suite('km', test('Distance', 3));
  });

  basicTest('CardHeader');
  basicTest('Card');
  basicTest('CityBikeCard');
  basicTest('CityBikeContent');
  basicTest('CityBikeAvailability');
  basicTest('CityBikeUse');

  gemini.suite('FavouriteLocation', test('FavouriteLocation', 1,
    '#FavouriteLocation .component-example:nth-of-type(1) .component .realtime-icon'));

  gemini.suite('TripRouteStop', () => {
    gemini.suite('non-realtime', test('TripRouteStop'));
    gemini.suite('realtime', test('TripRouteStop', [
      '#TripRouteStop .component-example:nth-of-type(2) .component',
      '#TripRouteStop .component-example:nth-of-type(2) .component svg.realtime',
    ], '#TripRouteStop .component-example:nth-of-type(2) .component svg.realtime'
    ));
  });
  gemini.suite('Favourite', () => {
    gemini.suite('favourite', test('Favourite'));
    gemini.suite('favourite-hovered', test('Favourite', 1, [], (actions) => actions.mouseMove(
      '#Favourite .component-example:nth-of-type(1) .component svg'
    )));
    gemini.suite('not-favourite', test('Favourite', 2));
    gemini.suite('not-favourite-hovered', test('Favourite', 2, [], (actions) => actions.mouseMove(
      '#Favourite .component-example:nth-of-type(2) .component svg'
    )));
  });

  basicTest('IconWithTail');
  basicTest('SelectedIconWithTail');
  basicTest('IconWithCaution');
  basicTest('IconWithBigCaution');

  gemini.suite('TimeNavigationButtons', () => {
    gemini.suite('normal', test('TimeNavigationButtons'));
    gemini.suite('hovered', test('TimeNavigationButtons', 1, [], (actions) => {
      actions.mouseMove(
        '#TimeNavigationButtons .component-example:nth-of-type(1) .component button:first-of-type'
      );
    }));
  });

  basicTest('TimeSelectors');

  gemini.suite('RightOffcanvasToggle', () => {
    gemini.suite('default', test('RightOffcanvasToggle'));
    gemini.suite('adjusted', test('RightOffcanvasToggle', 2));
  });

  basicTest('MarkerSelectPopup');
  basicTest('SelectStopRow');
  basicTest('SelectCityBikeRow');
  basicTest('TicketInformation');
  basicTest('RouteScheduleDateSelect');
  basicTest('RouteScheduleHeader');
  basicTest('RouteScheduleStopSelect');
  basicTest('RouteScheduleTripRow');

  gemini.suite('ModeFilter', () => {
    gemini.suite('Grey buttons', test('ModeFilter'));
    gemini.suite('White buttons', test('ModeFilter',
      ['#ModeFilter .nearby-routes .component-example:nth-of-type(1) .component']));
  });
});

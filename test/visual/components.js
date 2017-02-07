/* global gemini */


/**
 * Customizable test function
 * @componentName the component name to test
 * @variationName variation name
 * @aptureOrExampleNumber example number (index starts from 1) or array of
 *   selectors for capture-elements
 * @ignoreElements ignore ignoreElements selector (string) or selectors (Array of string)
 * @fn callback(actions, find) –  Optional callback describes a sequence of actions to bring the
 * page to this state, starting from a previous state of the suite.
**/
function testVariation(componentName, variationName = 'normal', captureOrExampleNumber = 1,
  ignoreElements, fn = () => {}) {
  return new Promise(
    (resolve) => {
      gemini.suite(`${componentName}_${variationName}`, (suite) => {
        try {
          let capture = `.component-example:nth-of-type(${captureOrExampleNumber}) .component`;
          if (captureOrExampleNumber instanceof Array) {
            capture = captureOrExampleNumber;
          }
          suite
            .setUrl(`/styleguide/component/${componentName}?en`)
            .setCaptureElements(capture)
            .ignoreElements(ignoreElements || [])
            .capture(variationName, {}, fn);
          resolve(suite);
        } catch (error) {
          console.error('Error occurred while testing variation', variationName);
          throw error;
        }
      });
    });
}

const skip = (browsers => (suite) => { suite.skip(browsers); });


// tests//
testVariation('Departure', 'normal', 1, '.component-example:nth-of-type(1) .component .realtime-icon').then(skip('ie11')).catch(() => {});
testVariation('Departure', 'added-padding', 2);
testVariation('Departure', 'with-stop', 3);
testVariation('Departure', 'isArrival', 4);

testVariation('DepartureTime', 'normal', 2);
testVariation('DepartureTime', 'canceled', 3);


testVariation('RouteNumber', 'normal');
testVariation('RouteNumber', 'vertical', 2);

testVariation('RouteDestination', 'normal');
testVariation('RouteDestination', 'isArrival', 2);


testVariation('Distance', 'zero');
testVariation('Distance', 'meters', 2);
testVariation('Distance', 'km', 3);

testVariation('PlatformNumber');

testVariation('CardHeader');
testVariation('Card');
testVariation('CityBikeCard');
testVariation('CityBikeContent');
testVariation('CityBikeAvailability');
testVariation('CityBikeUse');

testVariation('Availability');

testVariation('ParkAndRideAvailability', 'non-realtime');
testVariation('ParkAndRideAvailability', 'realtime', 2);

testVariation('FavouriteLocation', 'normal', 1,
      '.component-example:nth-of-type(1) .component .realtime-icon').then(skip('ie11'));

testVariation('EmptyFavouriteLocationSlot');

testVariation('TripRouteStop', 'non-realtime');
testVariation('TripRouteStop', 'realtime', [
  '.component-example:nth-of-type(2) .component',
], '.component-example:nth-of-type(2) .component svg.realtime').then(skip('ie11'));

testVariation('Favourite', 'normal');
testVariation('Favourite', 'hovered', 1, [], actions => actions.mouseMove(
      '.component-example:nth-of-type(1) .component svg'));
testVariation('Favourite', 'not-favourite', 2);
testVariation('Favourite', 'not-favourite-hovered', 2, [], actions => actions.mouseMove(
      '.component-example:nth-of-type(2) .component svg'));


testVariation('IconWithTail', 'normal');
testVariation('IconWithTail', 'rotate', 2);
testVariation('IconWithTail', 'class', 3);
testVariation('IconWithTail', 'notail', 4);

testVariation('SelectedIconWithTail');
testVariation('IconWithCaution');
testVariation('IconWithBigCaution');


testVariation('TimeNavigationButtons', 'normal');
testVariation('TimeNavigationButtons', 'hovered', 1, [], (actions) => {
  actions.mouseMove(
         // eslint-disable-next-line comma-dangle
        '.component-example:nth-of-type(1) .component button:first-of-type'
      ).wait(400); // Wait for animation to happen
});

testVariation('TimeSelectors').then(skip(['ie11', 'safari10'])); // TODO figure out why time differs when run locally & snap

testVariation('RightOffcanvasToggle', 'default');
testVariation('RightOffcanvasToggle', 'adjusted', 2);

testVariation('MarkerSelectPopup');
testVariation('SelectStopRow');
testVariation('SelectTerminalRow');
testVariation('SelectCityBikeRow');
testVariation('SelectParkAndRideRow');
testVariation('TicketInformation');
testVariation('RouteScheduleDateSelect');
testVariation('RouteScheduleHeader');
testVariation('RouteScheduleStopSelect');
testVariation('RouteScheduleTripRow');

testVariation('AppBarSmall', 'with-back-arrow');
testVariation('AppBarSmall', 'without-back-arrow', 2);
testVariation('AppBarSmall', 'with-logo', 3);

testVariation('AppBarLarge');

testVariation('FakeSearchWithButton', 'basic');
testVariation('FakeSearchWithButton', 'large', 2);


testVariation('FrontPagePanelLarge');
testVariation('FrontPagePanelSmall');
testVariation('ExternalLink');
testVariation('ExternalLink', 'with-icon-and-text', 2);
testVariation('LangSelect');

testVariation('ModeFilter', 'grey-buttons');
testVariation('ModeFilter', 'white-buttons', [
  '.nearby-routes .component-example:nth-of-type(1) .component',
]);


testVariation('RouteStop', 'normal', [
  '.component-example:nth-of-type(1) .component',
], '.component-example:nth-of-type(1) .component svg.realtime').then(skip('ie11'));


testVariation('DepartureRow', 'normal', 1, [
  '.component-example:nth-of-type(1) .component .realtime-icon',
]).then(skip('ie11'));

testVariation('DepartureRow', 'with-cancelation', 2);


testVariation('BicycleRentalStationRow', 'plenty-of-bikes');
testVariation('BicycleRentalStationRow', 'few-bikes', 2);
testVariation('BicycleRentalStationRow', 'no-bikes', 3);

testVariation('StopPageHeader');
testVariation('StopCardHeader');
testVariation('SplitBars');
testVariation('Labeled');
testVariation('Centered');
testVariation('InfoIcon');
testVariation('DepartureListHeader');
testVariation('NextDeparturesListHeader');
testVariation('SelectedStopPopupContent');
testVariation('PageFooter');

testVariation('FooterItem', 'basic');
testVariation('FooterItem', 'with-icon', 2);


testVariation('SummaryRow', 'passive-small-today');
testVariation('SummaryRow', 'active-small-today', 2);
testVariation('SummaryRow', 'passive-large-today', 3);
testVariation('SummaryRow', 'active-large-today', 4);
testVariation('SummaryRow', 'passive-small-tomorrow', 5);
testVariation('SummaryRow', 'active-small-tomorrow', 6);
testVariation('SummaryRow', 'passive-large-tomorrow', 7);
testVariation('SummaryRow', 'active-large-tomorrow', 8);
testVariation('SummaryRow', 'open-large-today', 9);
testVariation('SummaryRow', 'open-large-tomorrow', 10);

testVariation('CurrentPositionSuggestionItem', 'with-position');
testVariation('CurrentPositionSuggestionItem', 'no-position', 2);

testVariation('SuggestionItem', 'Favourite');
testVariation('SuggestionItem', 'Address', 2);
testVariation('SuggestionItem', 'Route', 3);
testVariation('SuggestionItem', 'Stop', 4);

testVariation('DateWarning', 'tomorrow-show-warning', 2);

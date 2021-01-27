/* global gemini */
/* eslint-disable no-console */
/**
 * Customizable test function
 * @componentName the component name to test
 * @variationName variation name
 * @aptureOrExampleNumber example number (index starts from 1) or array of
 *   selectors for capture-elements
 * @ignoreElements ignore ignoreElements selector (string) or selectors (Array of string)
 * @fn callback(actions, find) –  Optional callback describes a sequence of actions to bring the
 * page to this state, starting from a previous state of the suite.
 * */
function testVariation(
  componentName,
  variationName = 'normal',
  captureOrExampleNumber = 1,
  ignoreElements,
  fn = () => {},
) {
  return new Promise(resolve => {
    gemini.suite(`${componentName}_${variationName}`, suite => {
      try {
        let capture = `.component-example:nth-of-type(${captureOrExampleNumber}) .component`;
        if (captureOrExampleNumber instanceof Array) {
          capture = captureOrExampleNumber;
        }
        suite
          .setUrl(`/styleguide/component/${componentName}?enmock`)
          .setCaptureElements(capture)
          .ignoreElements(ignoreElements || [])
          .capture(variationName, {}, fn);
        resolve(suite);
      } catch (error) {
        console.error('Error occurred while testing variation', variationName);
      }
    });
  });
}

const skip = browsers => suite => {
  suite.skip(browsers);
};

// tests//
// testVariation('IndexPage', 'normal', 1, [], actions => actions.wait(5000));

testVariation('WalkLeg', 'walk-start');
testVariation('WalkLeg', 'walk-middle', 2);
testVariation('WaitLeg');
testVariation('BicycleLeg', 'bicycle-leg-normal');
testVariation('BicycleLeg', 'bicycle-leg-walking-bike', 2);
testVariation('BicycleLeg', 'bicycle-leg-citybike', 3);
testVariation('BicycleLeg', 'bicycle-leg-citybike-walking-bike', 4);
testVariation('EndLeg');
testVariation('AirportCheckInLeg');
testVariation('AirportCollectLuggageLeg');
testVariation('BusLeg', 'scheduled');
testVariation('BusLeg', 'realtime', 2, ['svg.realtime-icon']);

testVariation('AirplaneLeg');
testVariation('SubwayLeg');
testVariation('TramLeg');
testVariation('RailLeg');
testVariation('FerryLeg');
testVariation('CarLeg');
testVariation('ViaLeg');
testVariation('CallAgencyLeg').then(skip('edge17'));

testVariation('RouteNumber', 'normal');
testVariation('RouteNumber', 'with-disruption', 2);
testVariation('RouteNumber', 'vertical', 4);
testVariation('RouteNumber', 'vertical-with-disruption', 5);

testVariation('PlatformNumber');

testVariation('CardHeader');
testVariation('Card');
testVariation('CityBikeCard');
// testVariation('CityBikeContent');
testVariation('CityBikeAvailability');
testVariation('CityBikeUse');

testVariation('Availability');

testVariation('ParkAndRideAvailability', 'non-realtime');
testVariation('ParkAndRideAvailability', 'realtime', 2);

testVariation('TripRouteStop', 'non-realtime');
testVariation(
  'TripRouteStop',
  'realtime',
  ['.component-example:nth-of-type(2) .component'],
  '.component-example:nth-of-type(2) .component svg.realtime',
);

testVariation('Favourite', 'normal');
testVariation('Favourite', 'hovered', 1, [], actions =>
  actions.mouseMove('.component-example:nth-of-type(1) .component svg'),
);
testVariation('Favourite', 'not-favourite', 2);
testVariation('Favourite', 'not-favourite-hovered', 2, [], actions =>
  actions.mouseMove('.component-example:nth-of-type(2) .component svg'),
);

testVariation('IconWithTail', 'normal');
testVariation('IconWithTail', 'rotate', 2);
testVariation('IconWithTail', 'class', 3);
testVariation('IconWithTail', 'notail', 4);

testVariation('SelectedIconWithTail');
testVariation('IconWithBigCaution');
testVariation('IconWithIcon', 'customStyle', 1);
testVariation('IconWithIcon', 'normal', 2);

testVariation('RightOffcanvasToggle', 'default');

testVariation('MarkerSelectPopup');
testVariation('SelectStopRow');
testVariation('SelectTerminalRow');
testVariation('SelectCityBikeRow');
testVariation('SelectParkAndRideRow');
testVariation('TicketInformation').then(skip('edge17'));

testVariation('DateSelect');
testVariation('RoutePatternSelect', 'two-options');
testVariation('RoutePatternSelect', 'normal', 2);
testVariation('RouteScheduleHeader');
testVariation('RouteScheduleStopSelect');
testVariation('RouteScheduleTripRow');

// testVariation('AppBarSmall', 'with-back-arrow');
// testVariation('AppBarSmall', 'without-back-arrow', 2);
// testVariation('AppBarSmall', 'with-logo', 3);
// testVariation('AppBarLarge');

testVariation('ExternalLink');
testVariation('ExternalLink', 'with-icon-and-text', 2);
testVariation('LangSelect');

testVariation(
  'RouteStop',
  'normal',
  ['.component-example:nth-of-type(1) .component'],
  '.component-example:nth-of-type(1) .component svg.realtime',
);

testVariation('StopPageHeader');
testVariation('Timetable');
testVariation('PageFooter');

testVariation('SummaryRow', 'large', 1);
testVariation('SummaryRow', 'small', 2);

testVariation('CallAgencyWarning');

// testVariation('SuggestionItem', 'Favourite');
// testVariation('SuggestionItem', 'Address', 2);
// testVariation('SuggestionItem', 'Route', 3);
// testVariation('SuggestionItem', 'Stop', 4);
// testVariation('SuggestionItem', 'Stop-without-timetable', 5);

testVariation('DateWarning', 'tomorrow-show-warning', 2);

testVariation('Error404');

testVariation('SelectMapLayersDialog').then(skip('ie11'));
testVariation('MainMenuContainer');

// testVariation('OriginDestinationBar', 'with-viapoint', 2);

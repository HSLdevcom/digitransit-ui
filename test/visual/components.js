/* global gemini */

gemini.suite('components', (parent) => {
  parent.setUrl('/styleguide');

  gemini.suite('Departure', () => {
    gemini.suite('normal', (suite) => {
      suite.setCaptureElements('#Departure .component-example:nth-of-type(1) .component')
      .ignoreElements('#Departure .component-example:nth-of-type(1) .component .realtime-icon')
      .capture('normal');
    });
    gemini.suite('added-padding', (suite) => {
      suite.setCaptureElements('#Departure .component-example:nth-of-type(2) .component')
      .capture('normal');
    });
    gemini.suite('with-stop', (suite) => {
      suite.setCaptureElements('#Departure .component-example:nth-of-type(3) .component')
      .capture('normal');
    });
  });

  gemini.suite('DepartureTime', () => {
    gemini.suite('normal', (suite) => {
      suite.setCaptureElements('#DepartureTime .component-example:nth-of-type(2) .component')
      .capture('normal');
    });
  });

  gemini.suite('RouteNumber', () => {
    gemini.suite('normal', (suite) => {
      suite.setCaptureElements('#RouteNumber .component-example:nth-of-type(1) .component')
      .capture('normal');
    });
    gemini.suite('vertical', (suite) => {
      suite.setCaptureElements('#RouteNumber .component-example:nth-of-type(3) .component')
      .capture('normal');
    });
  });

  gemini.suite('RouteDestination', (component) => {
    component.setCaptureElements('#RouteDestination .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('StopReference', (component) => {
    component.setCaptureElements('#StopReference .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('Distance', () => {
    gemini.suite('zero', (suite) => {
      suite.setCaptureElements('#Distance .component-example:nth-of-type(1) .component')
      .capture('normal');
    });
    gemini.suite('meters', (suite) => {
      suite.setCaptureElements('#Distance .component-example:nth-of-type(2) .component')
      .capture('normal');
    });
    gemini.suite('km', (suite) => {
      suite.setCaptureElements('#Distance .component-example:nth-of-type(3) .component')
      .capture('normal');
    });
  });

  gemini.suite('CardHeader', (component) => {
    component.setCaptureElements(
      '#CardHeader .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('Card', (component) => {
    component.setCaptureElements(
      '#Card .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('CityBikeCard', (component) => {
    component.setCaptureElements(
      '#CityBikeCard .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('CityBikeContent', (component) => {
    component.setCaptureElements(
      '#CityBikeContent .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('CityBikeAvailability', (component) => {
    component.setCaptureElements(
      '#CityBikeAvailability .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('CityBikeUse', (component) => {
    component.setCaptureElements(
      '#CityBikeUse .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('FavouriteLocation', (component) => {
    component.setCaptureElements(
      '#FavouriteLocation .component-example:nth-of-type(1) .component')
    .ignoreElements(
      '#FavouriteLocation .component-example:nth-of-type(1) .component .realtime-icon'
    )
    .capture('normal');
  });

  gemini.suite('TripRouteStop', () => {
    gemini.suite('non-realtime', (suite) => {
      suite.setCaptureElements('#TripRouteStop .component-example:nth-of-type(1) .component')
      .capture('normal');
    });
    gemini.suite('realtime', (suite) => {
      suite.setCaptureElements('#TripRouteStop .component-example:nth-of-type(2) .component')
      .capture('normal');
    });
  });

  gemini.suite('IconWithTail', (component) => {
    component.setCaptureElements(
      '#IconWithTail .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('TimeNavigationButtons', (component) => {
    component.setCaptureElements(
      '#TimeNavigationButtons .component-example:nth-of-type(1) .component')
    .capture('normal', { tolerance: 5 }, () => {})
    .capture('hovered', { tolerance: 5 }, (actions) => {
      actions.mouseMove(
        '#TimeNavigationButtons .component-example:nth-of-type(1) .component button:first-of-type'
      );
    });
  });

  gemini.suite('TimeSelectors', (component) => {
    component.setCaptureElements(
      '#TimeSelectors .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('RightOffcanvasToggle', () => {
    gemini.suite('default', (suite) => {
      suite.setCaptureElements('#RightOffcanvasToggle .component-example:nth-of-type(1) .component')
      .capture('normal');
    });
    gemini.suite('adjusted', (suite) => {
      suite.setCaptureElements('#RightOffcanvasToggle .component-example:nth-of-type(2) .component')
      .capture('normal');
    });
  });

  gemini.suite('MarkerSelectPopup', (component) => {
    component.setCaptureElements(
      '#MarkerSelectPopup .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('SelectStopRow', (component) => {
    component.setCaptureElements(
      '#SelectStopRow .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('SelectCityBikeRow', (component) => {
    component.setCaptureElements(
      '#SelectCityBikeRow .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('TicketInformation', (component) => {
    component.setCaptureElements(
        '#TicketInformation .component-example:nth-of-type(1) .component')
      .capture('normal');
  });

  gemini.suite('RouteScheduleDateSelect', (component) => {
    component.setCaptureElements(
      '#RouteScheduleDateSelect .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('RouteScheduleHeader', (component) => {
    component.setCaptureElements(
      '#RouteScheduleHeader .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('RouteScheduleStopSelect', (component) => {
    component.setCaptureElements(
      '#RouteScheduleStopSelect .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('RouteScheduleTripRow', (component) => {
    component.setCaptureElements(
      '#RouteScheduleTripRow .component-example:nth-of-type(1) .component')
    .capture('normal');
  });
});

/* global gemini */

gemini.suite('components', (parent) => {
  parent.setUrl('/styleguide');

  gemini.suite('Departure', () => {
    gemini.suite('normal', (suite) => {
      suite.setCaptureElements('#Departure .component-example:nth-of-type(1) .component')
      .ignoreElements('.realtime-icon')
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

  gemini.suite('TimeNavigationButtons', (component) => {
    component.setCaptureElements(
      '#TimeNavigationButtons .component-example:nth-of-type(1) .component')
    .capture('normal')
    .capture('hovered', (actions) => {
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
});

/* global gemini */
/* eslint prefer-arrow-callback: 0 */

gemini.suite('components', function (parent) {
  parent.setUrl('/styleguidelines');

  gemini.suite('Departure', function () {
    gemini.suite('normal', function (suite) {
      suite.setCaptureElements('#Departure .component-example:nth-of-type(1) .component')
      .ignoreElements('.realtime-icon')
      .capture('normal');
    });
    gemini.suite('added-padding', function (suite) {
      suite.setCaptureElements('#Departure .component-example:nth-of-type(2) .component')
      .capture('normal');
    });
    gemini.suite('with-stop', function (suite) {
      suite.setCaptureElements('#Departure .component-example:nth-of-type(3) .component')
      .capture('normal');
    });
  });

  gemini.suite('DepartureTime', function () {
    gemini.suite('normal', function (suite) {
      suite.setCaptureElements('#DepartureTime .component-example:nth-of-type(2) .component')
      .capture('normal');
    });
  });

  gemini.suite('RouteNumber', function () {
    gemini.suite('normal', function (suite) {
      suite.setCaptureElements('#RouteNumber .component-example:nth-of-type(1) .component')
      .capture('normal');
    });
    gemini.suite('vertical', function (suite) {
      suite.setCaptureElements('#RouteNumber .component-example:nth-of-type(3) .component')
      .capture('normal');
    });
  });

  gemini.suite('RouteDestination', function (component) {
    component.setCaptureElements('#RouteDestination .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('StopReference', function (component) {
    component.setCaptureElements('#StopReference .component-example:nth-of-type(1) .component')
    .capture('normal');
  });

  gemini.suite('Distance', function () {
    gemini.suite('zero', function (suite) {
      suite.setCaptureElements('#Distance .component-example:nth-of-type(1) .component')
      .capture('normal');
    });
    gemini.suite('meters', function (suite) {
      suite.setCaptureElements('#Distance .component-example:nth-of-type(2) .component')
      .capture('normal');
    });
    gemini.suite('km', function (suite) {
      suite.setCaptureElements('#Distance .component-example:nth-of-type(3) .component')
      .capture('normal');
    });
  });
});

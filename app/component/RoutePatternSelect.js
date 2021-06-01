/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
/* eslint-disable import/no-unresolved */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import cx from 'classnames';
import sortBy from 'lodash/sortBy';
import { routerShape, RedirectException } from 'found';
import Autosuggest from 'react-autosuggest';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { enrichPatterns } from '@digitransit-util/digitransit-util';
import { FormattedMessage, intlShape } from 'react-intl';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import {
  routePatterns as exampleRoutePatterns,
  twoRoutePatterns as exampleTwoRoutePatterns,
} from './ExampleData';
import { isBrowser } from '../util/browser';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import { addAnalyticsEvent } from '../util/analyticsUtils';
// DT-3317

const DATE_FORMAT = 'YYYYMMDD';

function patternOptionText(pattern) {
  if (pattern) {
    let destinationName = pattern.headsign;
    if (destinationName === null) {
      destinationName = pattern.stops[pattern.stops.length - 1].name;
    }
    const text = `${pattern.stops[0].name} ➔ ${destinationName}`;
    return text;
  }
  return '';
}

function patternTextWithIcon(pattern) {
  if (pattern) {
    const text = patternOptionText(pattern);
    const i = text.search(/➔/);
    if (i === -1) {
      return text;
    }
    return (
      <>
        {text.slice(0, i)}
        <Icon className="in-text-arrow" img="icon-icon_arrow-right-long" />
        <span className="sr-only">➔</span>
        {text.slice(i + 1)}
      </>
    );
  }
  return <></>;
}

class RoutePatternSelect extends Component {
  constructor(props) {
    super(props);
    this.resultsUpdatedAlertRef = React.createRef();
  }

  static propTypes = {
    params: PropTypes.object.isRequired,
    className: PropTypes.string.isRequired,
    route: PropTypes.object.isRequired,
    onSelectChange: PropTypes.func.isRequired,
    serviceDay: PropTypes.string.isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
    gtfsId: PropTypes.string.isRequired,
    useCurrentTime: PropTypes.bool, // DT-3182
    lang: PropTypes.string.isRequired, // DT-3347
  };

  static contextTypes = {
    router: routerShape.isRequired,
    config: PropTypes.object, // DT-3317
    getStore: PropTypes.func.isRequired, // DT-3347
    intl: intlShape.isRequired,
  };

  getOptions = () => {
    const { gtfsId, params, route } = this.props;
    const { router } = this.context;
    const { patterns } = route;

    if (patterns.length === 0) {
      return null;
    }

    const futureTrips = enrichPatterns(
      patterns,
      false,
      this.context.config.itinerary.serviceTimeRange,
    );

    if (futureTrips.length === 0) {
      return null;
    }

    const options = sortBy(
      sortBy(futureTrips, 'inFuture').reverse(),
      'countTripsForDate',
    ).reverse();
    if (options.every(o => o.code !== params.patternId)) {
      if (isBrowser) {
        router.replace(
          `/${PREFIX_ROUTES}/${gtfsId}/${PREFIX_STOPS}/${options[0].code}`,
        );
      } else {
        throw new RedirectException(
          `/${PREFIX_ROUTES}/${gtfsId}/${PREFIX_STOPS}/${options[0].code}`,
        );
      }
    }
    return options;
  };

  render() {
    const { intl } = this.context;
    const options = this.getOptions();
    const currentPattern = options.find(
      o => o.code === this.props.params.patternId,
    );

    const possibleMainRoutes = options.slice(0, 2).filter(o => !o.inFuture);
    let mainRoutes = options.slice(0, 2).filter(o => !o.inFuture);
    if (
      possibleMainRoutes.every(o => o.directionId === 0) ||
      possibleMainRoutes.every(o => o.directionId === 1)
    ) {
      mainRoutes = possibleMainRoutes.slice(0, 1);
    }

    const specialRoutes = options
      .slice(mainRoutes.length)
      .filter(o => !o.inFuture);
    const futureRoutes = options
      .slice(mainRoutes.length)
      .filter(o => o.inFuture);

    const noSpecialRoutes = !specialRoutes || specialRoutes.length === 0;
    const noFutureRoutes = !futureRoutes || futureRoutes.length === 0;

    const renderButtonOnly =
      mainRoutes &&
      mainRoutes.length > 0 &&
      mainRoutes.length <= 2 &&
      noSpecialRoutes &&
      noFutureRoutes;

    const directionSwap = mainRoutes.length === 2;
    if (renderButtonOnly) {
      const otherPattern = mainRoutes.find(
        o => o.code !== this.props.params.patternId,
      );
      return (
        <div
          className={cx('route-pattern-select', this.props.className)}
          aria-atomic="true"
        >
          <label htmlFor="route-pattern-toggle-button">
            {directionSwap && (
              <span className="sr-only">
                <FormattedMessage id="swap-order-button-label" />
              </span>
            )}
            <button
              id="route-pattern-toggle-button"
              className="route-pattern-toggle"
              type="button"
              onClick={() =>
                directionSwap
                  ? this.props.onSelectChange(otherPattern.code)
                  : null
              }
            >
              {patternTextWithIcon(currentPattern)}
              {directionSwap && (
                <Icon className="toggle-icon" img="icon-icon_direction-c" />
              )}
            </button>
          </label>
        </div>
      );
    }

    const optionArray = [];
    if (mainRoutes.length > 0) {
      optionArray.push({ options: mainRoutes, name: '' });
    }
    if (specialRoutes.length > 0) {
      optionArray.push({
        options: specialRoutes,
        name: intl.formatMessage({
          id: 'route-page.special-routes',
        }),
      });
    }
    if (futureRoutes.length > 0) {
      optionArray.push({
        options: futureRoutes,
        name: intl.formatMessage({
          id: 'route-page.future-routes',
        }),
      });
    }

    const sectionTitleFontWeight =
      this.context.config.appBarStyle === 'hsl' ? 500 : 600;

    return (
      <div
        className={cx('route-pattern-select', this.props.className)}
        aria-atomic="true"
        style={{
          '--sectionTitleFontWeight': `${sectionTitleFontWeight}`,
        }}
      >
        {/* eslint-disable-next-line  jsx-a11y/label-has-associated-control */}
        <label htmlFor="select-route-pattern-input">
          <span className="sr-only">
            <FormattedMessage id="route-page.pattern-select-title" />
          </span>
          <Autosuggest
            id="select-route-pattern"
            suggestions={optionArray}
            multiSection
            renderSectionTitle={s => {
              return s.name || null;
            }}
            getSectionSuggestions={s => {
              return s.options;
            }}
            getSuggestionValue={s => s.code}
            renderSuggestion={s => (
              <>
                {patternTextWithIcon(s)}
                {s.code === currentPattern.code && (
                  <>
                    <Icon className="check" img="icon-icon_check" />
                    <span className="sr-only">
                      <FormattedMessage id="route-page.pattern-chosen" />
                    </span>
                  </>
                )}
              </>
            )}
            onSuggestionsFetchRequested={() => null}
            shouldRenderSuggestions={() => true}
            inputProps={{
              value: this.props.params && patternOptionText(currentPattern),
              onChange: (_, { newValue, method }) => {
                if (['click', 'enter'].includes(method)) {
                  this.props.onSelectChange(newValue);
                }
              },
              onMouseDown: () => {
                addAnalyticsEvent({
                  category: 'Route',
                  action: 'OpenDirectionMenu',
                  name: null,
                });
              },
              id: 'select-route-pattern-input',
              'aria-autocomplete': 'none',
              readOnly: true,
              'aria-labelledby': 'pattern-select-label-text',
            }}
            renderInputComponent={inputProps => {
              return (
                <>
                  <div className="input-display" aria-hidden="true">
                    {patternTextWithIcon(currentPattern)}
                    <Icon
                      className="dropdown-arrow"
                      img="icon-icon_arrow-collapse"
                    />
                  </div>
                  <input {...inputProps} />
                </>
              );
            }}
            focusInputOnSuggestionClick={false}
            onSuggestionsClearRequested={() => null}
          />
        </label>
      </div>
    );
  }
}

const defaultProps = {
  className: 'bp-large',
  serviceDay: '20190306',
  relay: {
    refetch: (variables, renderVariables, callback) => {
      callback();
    },
  },
  params: {
    routeId: 'HSL:1010',
    patternId: 'HSL:1010:0:01',
  },
  useCurrentTime: true,
};

RoutePatternSelect.description = () => (
  <div>
    <p>Display a dropdown to select the pattern for a route</p>
    <ComponentUsageExample>
      <RoutePatternSelect
        route={exampleRoutePatterns}
        onSelectChange={() => {}}
        gtfsId="HSL:1010"
        lang="en"
        {...defaultProps}
      />
    </ComponentUsageExample>
    <ComponentUsageExample>
      <RoutePatternSelect
        route={exampleTwoRoutePatterns}
        onSelectChange={() => {}}
        gtfsId="HSL:1010"
        lang="en"
        {...defaultProps}
      />
    </ComponentUsageExample>
  </div>
);

// DT-2531: added activeDates
const withStore = createRefetchContainer(
  connectToStores(RoutePatternSelect, ['PreferencesStore'], context => ({
    serviceDay: context
      .getStore('TimeStore')
      .getCurrentTime()
      .format(DATE_FORMAT),
    lang: context.getStore('PreferencesStore').getLanguage(), // DT-3347
  })),
  {
    route: graphql`
      fragment RoutePatternSelect_route on Route
      @argumentDefinitions(date: { type: "String" }) {
        patterns {
          code
          directionId
          headsign
          stops {
            name
          }
          activeDates: trips {
            serviceId
            day: activeDates
          }
          tripsForDate: tripsForDate(serviceDate: $date) {
            stoptimes: stoptimesForDate(serviceDate: $date) {
              scheduledDeparture
              serviceDay
            }
          }
        }
      }
    `,
  },
  graphql`
    query RoutePatternSelectQuery($routeId: String!, $date: String!) {
      route(id: $routeId) {
        ...RoutePatternSelect_route @arguments(date: $date)
      }
    }
  `,
);

export { withStore as default, RoutePatternSelect as Component };

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
import {
  enrichPatterns,
  routePatternOptionText,
} from '@digitransit-util/digitransit-util';
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

function patternTextWithIcon(lang, pattern, isTogglable) {
  const text = routePatternOptionText(lang, pattern, isTogglable);
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

  state = {
    loading: true,
  };

  componentDidMount = () => {
    this.props.relay.refetch(
      {
        date: this.props.serviceDay,
      },
      null,
      () => this.setState({ loading: false }),
    );
  };

  getOptions = () => {
    const { gtfsId, params, route, useCurrentTime } = this.props; // DT-3182: added useCurrentTime, DT-3347: added lang
    const { router } = this.context;
    const { patterns } = route;

    if (patterns.length === 0) {
      return null;
    }

    const futureTrips = enrichPatterns(
      patterns,
      useCurrentTime,
      this.context.config.itinerary.serviceTimeRange,
    );

    if (futureTrips.length === 0) {
      return null;
    }

    // DT-3182: added sortBy 'tripsForDate.length' (reverse() = descending)
    // DT-2531: added sortBy 'activeDates.length'
    const options = sortBy(
      sortBy(
        sortBy(sortBy(futureTrips, 'code').reverse(), 'activeDates.length'),
        'activeDates[0]',
      ).reverse(),
      'tripsForDate.length',
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
    if (this.state.loading === true) {
      return (
        <div
          className={cx('route-pattern-select', this.props.className)}
          aria-atomic="true"
        />
      );
    }

    const { intl } = this.context;
    const options = this.getOptions();
    const currentPattern = options.find(
      o => o.code === this.props.params.patternId,
    );
    const renderButtonOnly = options && options.length === 2;
    if (renderButtonOnly) {
      const otherPattern = options.find(
        o => o.code !== this.props.params.patternId,
      );
      return (
        <div
          className={cx('route-pattern-select', this.props.className)}
          aria-atomic="true"
        >
          <label htmlFor="route-pattern-toggle-button">
            <span className="sr-only">
              <FormattedMessage id="swap-order-button-label" />
            </span>
            <button
              id="route-pattern-toggle-button"
              className="route-pattern-toggle"
              type="button"
              onClick={() => this.props.onSelectChange(otherPattern.code)}
            >
              {patternTextWithIcon(this.props.lang, currentPattern, true)}
              <Icon className="toggle-icon" img="icon-icon_direction-c" />
            </button>
          </label>
        </div>
      );
    }
    const showExtraSection = options && options.length > 2;
    let suggestions;
    if (showExtraSection) {
      suggestions = [
        { options: options.slice(0, 2), name: '' },
        {
          options: options.slice(2),
          name: intl.formatMessage({
            id: 'route-page.special-patterns-name',
          }),
        },
      ];
    } else {
      suggestions = [{ options, name: '' }];
    }
    return (
      <div
        className={cx('route-pattern-select', this.props.className)}
        aria-atomic="true"
      >
        {/* eslint-disable-next-line  jsx-a11y/label-has-associated-control */}
        <label htmlFor="select-route-pattern-input">
          <span className="sr-only">
            <FormattedMessage id="route-page.pattern-select-title" />
          </span>
          <Autosuggest
            id="select-route-pattern"
            suggestions={suggestions}
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
                {patternTextWithIcon(this.props.lang, s, false)}
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
              value:
                this.props.params &&
                routePatternOptionText(this.props.lang, currentPattern, false),
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
                    {patternTextWithIcon(
                      this.props.lang,
                      currentPattern,
                      false,
                    )}
                    <Icon
                      className="dropdown-arrow"
                      img="icon-icon_arrow-collapse"
                    />
                  </div>
                  <input {...inputProps} />
                </>
              );
            }}
            focusInputOnSuggestionClick
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
          headsign
          stops {
            name
          }
          tripsForDate(serviceDate: $date) {
            id
            stoptimes: stoptimesForDate(serviceDate: $date) {
              scheduledArrival
              scheduledDeparture
              serviceDay
              stop {
                id
              }
            }
          }
          activeDates: trips {
            day: activeDates
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

/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
/* eslint-disable import/no-unresolved */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  createRefetchContainer,
  fetchQuery,
  graphql,
  ReactRelayContext,
} from 'react-relay';
import cx from 'classnames';
import sortBy from 'lodash/sortBy';
import { routerShape, RedirectException, Link } from 'found';
import Autosuggest from 'react-autosuggest';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { enrichPatterns } from '@digitransit-util/digitransit-util';
import { FormattedMessage, intlShape } from 'react-intl';
import Icon from './Icon';
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

function filterSimilarRoutes(routes, currentRoute) {
  const withoutCurrent = routes.filter(r => r.gtfsId !== currentRoute.gtfsId);

  let routeBasename = currentRoute.shortName;
  if (Number.isNaN(Number(routeBasename))) {
    routeBasename = routeBasename.replace(/\D/g, ''); // Delete all non-digits from the string
  }
  const onlyRelatedRoutes = withoutCurrent.filter(r =>
    Number.isNaN(Number(r.shortName.replace(routeBasename, '')[0])),
  );
  return sortBy(onlyRelatedRoutes, 'shortName');
}

function renderPatternSelectSuggestion(item, currentPattern) {
  if (item.stops) {
    return (
      <>
        {patternTextWithIcon(item)}
        {item.code === currentPattern.code && (
          <>
            <Icon className="check" img="icon-icon_check" />
            <span className="sr-only">
              <FormattedMessage id="route-page.pattern-chosen" />
            </span>
          </>
        )}
      </>
    );
  }
  if (item.shortName && item.longName && item.mode) {
    const routePath = `/${PREFIX_ROUTES}/${item.gtfsId}`;
    return (
      <Link
        to={routePath}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <div className="similar-route">
          <Icon
            className={item.mode.toLowerCase()}
            img={`icon-icon_${item.mode.toLowerCase()}`}
          />
          <div className="similar-route-text">
            <span className="similar-route-name">{item.shortName}</span>
            <span className="similar-route-longname">{item.longName}</span>
          </div>
          <div className="similar-route-arrow-container">
            <Icon
              className="similar-route-arrow"
              img="icon-icon_arrow-collapse--right"
            />
          </div>
        </div>
      </Link>
    );
  }
  return <></>;
}

class RoutePatternSelect extends Component {
  constructor(props) {
    super(props);
    this.resultsUpdatedAlertRef = React.createRef();
    this.state = {
      similarRoutes: [],
      loadingSimilar: true,
    };
    this.fetchSimilarRoutes(this.props.route);
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
    relayEnvironment: PropTypes.object,
  };

  static contextTypes = {
    router: routerShape.isRequired,
    config: PropTypes.object, // DT-3317
    getStore: PropTypes.func.isRequired, // DT-3347
    intl: intlShape.isRequired,
  };

  similarRoutesToOptions = () => {};

  fetchSimilarRoutes = route => {
    let searchSimilarTo = route.shortName;
    if (Number.isNaN(Number(route.shortName))) {
      searchSimilarTo = route.shortName.replace(/\D/g, ''); // Delete all non-digits from the string
    }
    if (!searchSimilarTo) {
      // Dont try to search similar routes for routes that are named with letters (eg. P train)
      return;
    }
    const query = graphql`
      query RoutePatternSelect_similarRoutesQuery(
        $name: String
        $mode: [Mode]
      ) {
        routes(name: $name, transportModes: $mode) {
          gtfsId
          shortName
          longName
          mode
        }
      }
    `;

    const params = { name: searchSimilarTo, mode: route.mode };
    fetchQuery(this.props.relayEnvironment, query, params, {
      force: true,
    }).then(results => {
      this.setState({
        similarRoutes: filterSimilarRoutes(results.routes, this.props.route),
        loadingSimilar: false,
      });
    });
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
    const noSimilarRoutes =
      !this.state.similarRoutes || this.state.similarRoutes.length === 0;

    const renderButtonOnly =
      mainRoutes &&
      mainRoutes.length > 0 &&
      mainRoutes.length <= 2 &&
      noSpecialRoutes &&
      noFutureRoutes &&
      noSimilarRoutes;

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

    if (
      this.context.config.showSimilarRoutesOnRouteDropDown &&
      !this.state.loadingSimilar &&
      this.state.similarRoutes?.length > 0
    ) {
      optionArray.push({
        options: this.state.similarRoutes,
        name: intl.formatMessage({
          id: 'route-page.similar-routes',
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
            renderSuggestion={s =>
              renderPatternSelectSuggestion(s, currentPattern)
            }
            onSuggestionsFetchRequested={() => null}
            shouldRenderSuggestions={() => true}
            onSuggestionSelected={(e, { suggestion, suggestionValue }) => {
              if (!suggestionValue && suggestion.gtfsId) {
                // for similarRoute links to work when selected with keyboard
                const routePath = `/${PREFIX_ROUTES}/${suggestion.gtfsId}`;
                this.context.router.push(routePath);
              }
            }}
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

// DT-2531: added activeDates
const withStore = createRefetchContainer(
  connectToStores(
    props => (
      <ReactRelayContext.Consumer>
        {({ environment }) => (
          <RoutePatternSelect {...props} relayEnvironment={environment} />
        )}
      </ReactRelayContext.Consumer>
    ),
    ['PreferencesStore'],
    context => ({
      serviceDay: context
        .getStore('TimeStore')
        .getCurrentTime()
        .format(DATE_FORMAT),
      lang: context.getStore('PreferencesStore').getLanguage(), // DT-3347
    }),
  ),
  {
    route: graphql`
      fragment RoutePatternSelect_route on Route
      @argumentDefinitions(date: { type: "String" }) {
        shortName
        mode
        gtfsId
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

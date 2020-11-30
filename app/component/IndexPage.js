/* eslint-disable import/no-extraneous-dependencies */
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape, Link } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import shouldUpdate from 'recompose/shouldUpdate';
import isEqual from 'lodash/isEqual';
import CtrlPanel from '@digitransit-component/digitransit-component-control-panel';
import TrafficNowLink from '@digitransit-component/digitransit-component-traffic-now-link';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import { getModesWithAlerts } from '@digitransit-search-util/digitransit-search-util-query-utils';
import storeOrigin from '../action/originActions';
import storeDestination from '../action/destinationActions';
import saveFutureRoute from '../action/FutureRoutesActions';
import withSearchContext from './WithSearchContext';
import { isBrowser } from '../util/browser';
import {
  getRoutePath,
  parseLocation,
  isItinerarySearchObjects,
  PREFIX_NEARYOU,
} from '../util/path';
import { addAnalyticsEvent } from '../util/analyticsUtils';

import OverlayWithSpinner from './visual/OverlayWithSpinner';
import { dtLocationShape } from '../util/shapes';
import withBreakpoint from '../util/withBreakpoint';
import Geomover from './Geomover';
import ComponentUsageExample from './ComponentUsageExample';
import scrollTop from '../util/scroll';
import FavouritesContainer from './FavouritesContainer';
import DatetimepickerContainer from './DatetimepickerContainer';
import { LightenDarkenColor } from '../util/colorUtils';

const DTAutoSuggestWithSearchContext = withSearchContext(DTAutoSuggest);
const DTAutosuggestPanelWithSearchContext = withSearchContext(
  DTAutosuggestPanel,
);

class IndexPage extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
    getStore: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  static propTypes = {
    breakpoint: PropTypes.string.isRequired,
    origin: dtLocationShape.isRequired,
    destination: dtLocationShape.isRequired,
    lang: PropTypes.string,
    currentTime: PropTypes.number.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    query: PropTypes.object.isRequired,
    favouriteModalAction: PropTypes.string,
    fromMap: PropTypes.string,
  };

  static defaultProps = { lang: 'fi' };

  /* eslint-disable no-param-reassign */
  processLocation = (locationString, intl) => {
    let location;
    if (locationString) {
      if (location.type === 'CurrentLocation') {
        location.address = intl.formatMessage({
          id: 'own-position',
          defaultMessage: 'Own Location',
        });
      }
    }
    return location;
  };

  componentDidMount() {
    const { from, to } = this.context.match.params;
    /* initialize stores from URL params */
    const origin = parseLocation(from);
    const destination = parseLocation(to);

    if (origin) {
      this.context.executeAction(storeOrigin, origin);
    }
    if (destination) {
      this.context.executeAction(storeDestination, destination);
    }
    scrollTop();
  }

  clickFavourite = favourite => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'ClickFavourite',
      name: null,
    });
    this.context.executeAction(storeDestination, favourite);
  };

  // DT-3551: handle logic for Traffic now link
  trafficNowHandler = (e, lang) => {
    window.location = `${this.context.config.URL.ROOTLINK}/${
      lang === 'fi' ? '' : `${lang}/`
    }${this.context.config.trafficNowLink[lang]}`;
  };

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    const { intl, config } = this.context;
    const { trafficNowLink, colors } = config;
    const color = colors.primary;
    const hoverColor = colors.hover || LightenDarkenColor(colors.primary, -20);
    const { breakpoint, destination, origin, lang } = this.props;
    const queryString = this.context.match.location.search;
    const searchSources =
      breakpoint !== 'large'
        ? ['Favourite', 'History', 'Datasource']
        : ['History', 'Datasource'];
    const stopAndRouteSearchSources = ['Favourite', 'History', 'Datasource'];
    const locationSearchTargets = [
      'Locations',
      'CurrentPosition',
      'FutureRoutes',
      'SelectFromOwnLocations',
      'Stops',
    ];
    const stopAndRouteSearchTargets =
      this.context.config.cityBike && this.context.config.cityBike.showCityBikes
        ? ['Stops', 'Routes', 'BikeRentalStations']
        : ['Stops', 'Routes'];

    const originToStopNearYou = {
      ...origin,
      queryString,
    };

    const alertsContext = {
      currentTime: this.props.currentTime,
      getModesWithAlerts,
    };

    const showSpinner = false;

    return breakpoint === 'large' ? (
      <div
        className={`front-page flex-vertical ${
          showSpinner && `blurred`
        } fullscreen bp-${breakpoint}`}
      >
        <div
          style={{ display: isBrowser ? 'block' : 'none' }}
          className="scrollable-content-wrapper momentum-scroll"
        >
          <CtrlPanel
            instance="hsl"
            language={lang}
            origin={origin}
            position="left"
          >
            <DTAutosuggestPanelWithSearchContext
              appElement="#app"
              searchPanelText={intl.formatMessage({
                id: 'where',
                defaultMessage: 'Where to?',
              })}
              origin={origin}
              destination={destination}
              originPlaceHolder="search-origin-index"
              destinationPlaceHolder="search-destination-index"
              lang={lang}
              sources={searchSources}
              targets={locationSearchTargets}
              breakpoint="large"
              color={color}
              hoverColor={hoverColor}
            />
            <div className="datetimepicker-container">
              <DatetimepickerContainer realtime color={color} />
            </div>
            <FavouritesContainer
              favouriteModalAction={this.props.favouriteModalAction}
              onClickFavourite={this.clickFavourite}
              lang={lang}
            />
            <CtrlPanel.SeparatorLine usePaddingBottom20 />
            {config.showNearYouButtons ? (
              <div className="near-you-buttons-container">
                <CtrlPanel.NearStopsAndRoutes
                  modes={config.nearYouModes}
                  urlPrefix={`/${PREFIX_NEARYOU}`}
                  language={lang}
                  showTitle
                  alertsContext={alertsContext}
                  LinkComponent={Link}
                  origin={originToStopNearYou}
                />
              </div>
            ) : (
              <div className="stops-near-you-text">
                <h2>
                  {' '}
                  {intl.formatMessage({
                    id: 'stop-near-you-title',
                    defaultMessage: 'Stops and lines near you',
                  })}
                </h2>
              </div>
            )}
            <DTAutoSuggestWithSearchContext
              appElement="#app"
              icon="search"
              id="stop-route-station"
              refPoint={origin}
              className="destination"
              placeholder="stop-near-you"
              value=""
              sources={stopAndRouteSearchSources}
              targets={stopAndRouteSearchTargets}
              color={color}
              hoverColor={hoverColor}
            />
            <CtrlPanel.SeparatorLine />
            {!trafficNowLink ||
              (trafficNowLink[lang] !== '' && (
                <TrafficNowLink
                  lang={lang}
                  handleClick={this.trafficNowHandler}
                />
              ))}
          </CtrlPanel>
        </div>
        {(showSpinner && <OverlayWithSpinner />) || null}
      </div>
    ) : (
      <div
        className={`front-page flex-vertical ${
          showSpinner && `blurred`
        } bp-${breakpoint}`}
      >
        {(showSpinner && <OverlayWithSpinner />) || null}
        <div
          style={{
            display: isBrowser ? 'block' : 'none',
            backgroundColor: '#ffffff',
          }}
        >
          <CtrlPanel instance="hsl" language={lang} position="bottom">
            <DTAutosuggestPanelWithSearchContext
              appElement="#app"
              searchPanelText={intl.formatMessage({
                id: 'where',
                defaultMessage: 'Where to?',
              })}
              origin={origin}
              destination={destination}
              originPlaceHolder="search-origin-index"
              destinationPlaceHolder="search-destination-index"
              lang={lang}
              sources={searchSources}
              targets={[
                'Locations',
                'CurrentPosition',
                'MapPosition',
                'FutureRoutes',
              ]}
              disableAutoFocus
              isMobile
              breakpoint="small"
              fromMap={this.props.fromMap}
              color={color}
              hoverColor={hoverColor}
            />
            <div className="datetimepicker-container">
              <DatetimepickerContainer realtime color={color} />
            </div>
            <FavouritesContainer
              onClickFavourite={this.clickFavourite}
              lang={lang}
              isMobile
            />
            <CtrlPanel.SeparatorLine />
            {config.showNearYouButtons ? (
              <div className="near-you-buttons-container">
                <CtrlPanel.NearStopsAndRoutes
                  modes={config.nearYouModes}
                  urlPrefix={`/${PREFIX_NEARYOU}`}
                  language={lang}
                  showTitle
                  alertsContext={alertsContext}
                  LinkComponent={Link}
                  origin={originToStopNearYou}
                />
              </div>
            ) : (
              <div className="stops-near-you-text">
                <h2>
                  {' '}
                  {intl.formatMessage({
                    id: 'stop-near-you-title',
                    defaultMessage: 'Stops and lines near you',
                  })}
                </h2>
              </div>
            )}
            <DTAutoSuggestWithSearchContext
              appElement="#app"
              icon="search"
              id="stop-route-station"
              refPoint={origin}
              className="destination"
              placeholder="stop-near-you"
              value=""
              sources={stopAndRouteSearchSources}
              targets={stopAndRouteSearchTargets}
              isMobile
              color={color}
              hoverColor={hoverColor}
            />
            <CtrlPanel.SeparatorLine />
            {!trafficNowLink ||
              (trafficNowLink[lang] !== '' && (
                <TrafficNowLink
                  lang={lang}
                  handleClick={this.trafficNowHandler}
                />
              ))}
          </CtrlPanel>
        </div>
      </div>
    );
  }
}

const Index = shouldUpdate(
  // update only when origin/destination/breakpoint, favourite store status or language changes
  (props, nextProps) => {
    return !(
      isEqual(nextProps.origin, props.origin) &&
      isEqual(nextProps.destination, props.destination) &&
      isEqual(nextProps.breakpoint, props.breakpoint) &&
      isEqual(nextProps.lang, props.lang) &&
      isEqual(nextProps.query, props.query)
    );
  },
)(IndexPage);

const IndexPageWithBreakpoint = withBreakpoint(Index);

IndexPageWithBreakpoint.description = (
  <ComponentUsageExample isFullscreen>
    <IndexPageWithBreakpoint destination={{}} origin={{}} routes={[]} />
  </ComponentUsageExample>
);

const IndexPageWithStores = connectToStores(
  IndexPageWithBreakpoint,
  ['OriginStore', 'DestinationStore', 'TimeStore', 'PreferencesStore'],
  (context, props) => {
    const origin = context.getStore('OriginStore').getOrigin();
    const destination = context.getStore('DestinationStore').getDestination();

    const { location } = props.match;
    if (isItinerarySearchObjects(origin, destination)) {
      const newRoute = {
        origin: {
          address: origin.address,
          coordinates: {
            lat: origin.lat,
            lon: origin.lon,
          },
        },
        destination: {
          address: destination.address,
          coordinates: {
            lat: destination.lat,
            lon: destination.lon,
          },
        },
        arriveBy: this.context.match.location.query.arriveBy
          ? this.context.match.location.query.arriveBy
          : false,
        time: this.context.match.location.query.time,
      };
      this.context.executeAction(saveFutureRoute, newRoute);

      const newLocation = {
        ...location,
        pathname: getRoutePath(origin, destination),
      };
      props.router.push(newLocation);
    }

    const newProps = {};
    const { query } = location;
    const { favouriteModalAction, fromMap } = query;
    if (favouriteModalAction) {
      newProps.favouriteModalAction = favouriteModalAction;
    }
    if (fromMap === 'origin' || fromMap === 'destination') {
      newProps.fromMap = fromMap;
    }
    newProps.origin = origin;
    newProps.destination = destination;
    newProps.lang = context.getStore('PreferencesStore').getLanguage();
    newProps.currentTime = context
      .getStore('TimeStore')
      .getCurrentTime()
      .unix();
    newProps.query = query; // defines itinerary search time & arriveBy

    return newProps;
  },
);

IndexPageWithStores.contextTypes = {
  ...IndexPageWithStores.contextTypes,
  executeAction: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};

const GeoIndexPage = Geomover(IndexPageWithStores);

export { GeoIndexPage as default, IndexPageWithBreakpoint as Component };

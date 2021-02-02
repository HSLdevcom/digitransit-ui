import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape, Link } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import shouldUpdate from 'recompose/shouldUpdate';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import CtrlPanel from '@digitransit-component/digitransit-component-control-panel';
import TrafficNowLink from '@digitransit-component/digitransit-component-traffic-now-link';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import { getModesWithAlerts } from '@digitransit-search-util/digitransit-search-util-query-utils';
import { createUrl } from '@digitransit-store/digitransit-store-future-route';
import moment from 'moment';
import storeOrigin from '../action/originActions';
import storeDestination from '../action/destinationActions';
import withSearchContext from './WithSearchContext';
import {
  getPathWithEndpointObjects,
  getStopRoutePath,
  parseLocation,
  sameLocations,
  isItinerarySearchObjects,
  PREFIX_NEARYOU,
  PREFIX_ITINERARY_SUMMARY,
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

const StopRouteSearch = withSearchContext(DTAutoSuggest);
const LocationSearch = withSearchContext(DTAutosuggestPanel);

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

  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  componentDidMount() {
    const { from, to } = this.context.match.params;
    /* initialize stores from URL params */
    const origin = parseLocation(from);
    const destination = parseLocation(to);

    // To prevent SSR from rendering something https://reactjs.org/docs/react-dom.html#hydrate
    this.setState({
      isClient: true,
    });

    // synchronizing page init using fluxible is - hard -
    // see navigation conditions in componentDidUpdate below
    if (!sameLocations(this.props.origin, origin)) {
      this.pendingOrigin = origin;
      this.context.executeAction(storeOrigin, origin);
    }
    if (!sameLocations(this.props.destination, destination)) {
      this.pendingDestination = destination;
      this.context.executeAction(storeDestination, destination);
    }

    scrollTop();
  }

  componentDidUpdate() {
    const { origin, destination } = this.props;

    if (this.pendingOrigin && isEqual(this.pendingOrigin, origin)) {
      delete this.pendingOrigin;
    }
    if (
      this.pendingDestination &&
      isEqual(this.pendingDestination, destination)
    ) {
      delete this.pendingDestination;
    }
    if (this.pendingOrigin || this.pendingDestination) {
      // not ready for navigation yet
      return;
    }

    const { router, match, config } = this.context;
    const { location } = match;

    if (isItinerarySearchObjects(origin, destination)) {
      const newLocation = {
        ...location,
        pathname: getPathWithEndpointObjects(
          origin,
          destination,
          PREFIX_ITINERARY_SUMMARY,
        ),
      };
      if (newLocation.query.time === undefined) {
        newLocation.query.time = moment().unix();
      }
      router.push(newLocation);
    } else {
      const path = getPathWithEndpointObjects(
        origin,
        destination,
        config.indexPath,
      );
      if (path !== location.pathname) {
        const newLocation = {
          ...location,
          pathname: path,
        };
        router.replace(newLocation);
      }
    }
  }

  onSelectStopRoute = item => {
    this.context.router.push(getStopRoutePath(item));
  };

  onSelectLocation = (item, id) => {
    const { router, executeAction } = this.context;
    if (item.type === 'FutureRoute') {
      router.push(createUrl(item));
    } else if (id === 'origin') {
      executeAction(storeOrigin, item);
    } else {
      executeAction(storeDestination, item);
    }
  };

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
    if (!this.state.isClient) {
      return null;
    }
    const { intl, config } = this.context;
    const { trafficNowLink, colors } = config;
    const color = colors.primary;
    const hoverColor = colors.hover || LightenDarkenColor(colors.primary, -20);
    const { breakpoint, lang } = this.props;
    const origin = this.pendingOrigin || this.props.origin;
    const destination = this.pendingDestination || this.props.destination;
    const queryString = this.context.match.location.search;
    const sources = ['Favourite', 'History', 'Datasource'];
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
      feedIds: config.feedIds,
    };

    const showSpinner =
      (origin.type === 'CurrentLocation' && !origin.address) ||
      (destination.type === 'CurrentLocation' && !destination.address);
    let refPoint;
    if (!isEmpty(origin)) {
      refPoint = origin;
    } else if (!isEmpty(destination)) {
      refPoint = destination;
    }
    const locationSearchProps = {
      appElement: '#app',
      origin,
      destination,
      lang,
      sources,
      color,
      hoverColor,
      refPoint,
      searchPanelText: intl.formatMessage({
        id: 'where',
        defaultMessage: 'Where to?',
      }),
      originPlaceHolder: 'search-origin-index',
      destinationPlaceHolder: 'search-destination-index',
      selectHandler: this.onSelectLocation,
      onGeolocationStart: this.onSelectLocation,
      fromMap: this.props.fromMap,
    };

    const stopRouteSearchProps = {
      appElement: '#app',
      icon: 'search',
      id: 'stop-route-station',
      className: 'destination',
      placeholder: 'stop-near-you',
      selectHandler: this.onSelectStopRoute,
      value: '',
      lang,
      color,
      hoverColor,
      sources,
      targets: stopAndRouteSearchTargets,
    };

    return breakpoint === 'large' ? (
      <div
        className={`front-page flex-vertical ${
          showSpinner && `blurred`
        } fullscreen bp-${breakpoint}`}
      >
        <div
          style={{ display: 'block' }}
          className="scrollable-content-wrapper momentum-scroll"
        >
          <CtrlPanel
            instance="hsl"
            language={lang}
            origin={origin}
            position="left"
          >
            <LocationSearch
              targets={[
                'Locations',
                'CurrentPosition',
                'FutureRoutes',
                'Stops',
              ]}
              {...locationSearchProps}
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
                  omitLanguageUrl
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
            <StopRouteSearch {...stopRouteSearchProps} />
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
            display: 'block',
            backgroundColor: '#ffffff',
          }}
        >
          <CtrlPanel instance="hsl" language={lang} position="bottom">
            <LocationSearch
              targets={[
                'Locations',
                'CurrentPosition',
                'MapPosition',
                'FutureRoutes',
                'Stops',
              ]}
              disableAutoFocus
              isMobile
              {...locationSearchProps}
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
                  omitLanguageUrl
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
            <div className="stop-route-search-container">
              <StopRouteSearch isMobile {...stopRouteSearchProps} />
            </div>
            <CtrlPanel.SeparatorLine usePaddingBottom20 />
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

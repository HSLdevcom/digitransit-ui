import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import shouldUpdate from 'recompose/shouldUpdate';
import isEqual from 'lodash/isEqual';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import { getModesWithAlerts } from '@digitransit-search-util/digitransit-search-util-query-utils';
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
import { dtLocationShape } from '../util/shapes';
import withBreakpoint from '../util/withBreakpoint';
import Geomover from './Geomover';
import scrollTop from '../util/scroll';
import { LightenDarkenColor } from '../util/colorUtils';
import { getRefPoint } from '../util/apiUtils';
import { isKeyboardSelectionEvent } from '../util/browser';
import LazilyLoad, { importLazy } from './LazilyLoad';
import {
  getTransportModes,
  getNearYouModes,
  showCityBikes,
} from '../util/modeUtils';

const StopRouteSearch = withSearchContext(DTAutoSuggest);
const LocationSearch = withSearchContext(DTAutosuggestPanel);
const modules = {
  CtrlPanel: () =>
    importLazy(
      import('@digitransit-component/digitransit-component-control-panel'),
    ),
  TrafficNowLink: () =>
    importLazy(
      import('@digitransit-component/digitransit-component-traffic-now-link'),
    ),
  OverlayWithSpinner: () => importLazy(import('./visual/OverlayWithSpinner')),
  FavouritesContainer: () => importLazy(import('./FavouritesContainer')),
  DatetimepickerContainer: () =>
    importLazy(import('./DatetimepickerContainer')),
};

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
    locationState: dtLocationShape.isRequired,
  };

  static defaultProps = { lang: 'fi' };

  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  componentDidMount() {
    const { from, to } = this.context.match.params;

    // synchronizing page init using fluxible is - hard -
    // see navigation conditions in componentDidUpdate below
    if (from) {
      const origin = parseLocation(from);
      if (!sameLocations(this.props.origin, origin)) {
        this.pendingOrigin = origin;
        this.context.executeAction(storeOrigin, origin);
      }
    }

    if (to) {
      const destination = parseLocation(to);
      if (!sameLocations(this.props.destination, destination)) {
        this.pendingDestination = destination;
        this.context.executeAction(storeDestination, destination);
      }
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

  clickStopNearIcon = (url, kbdEvent) => {
    if (kbdEvent && !isKeyboardSelectionEvent(kbdEvent)) {
      return;
    }
    this.context.router.push(url);
  };

  onSelectLocation = (item, id) => {
    const { router, executeAction } = this.context;
    if (item.type === 'FutureRoute') {
      router.push(item.properties.url);
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

  filterObject = (obj, filter, filterValue) =>
    Object.keys(obj).reduce(
      (acc, val) =>
        obj[val][filter] === filterValue
          ? {
              ...acc,
              [val]: obj[val],
            }
          : acc,
      {},
    );

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  render() {
    const { intl, config } = this.context;
    const { trafficNowLink, colors, fontWeights } = config;
    const color = colors.primary;
    const hoverColor = colors.hover || LightenDarkenColor(colors.primary, -20);
    const { breakpoint, lang } = this.props;
    const origin = this.pendingOrigin || this.props.origin;
    const destination = this.pendingDestination || this.props.destination;
    const sources = ['Favourite', 'History', 'Datasource'];
    const stopAndRouteSearchTargets = ['Stops', 'Routes'];
    const locationSearchTargets = [
      'Locations',
      'CurrentPosition',
      'FutureRoutes',
      'Stops',
    ];

    if (showCityBikes(this.context.config.cityBike?.networks)) {
      stopAndRouteSearchTargets.push('BikeRentalStations');
      locationSearchTargets.push('BikeRentalStations');
    }
    const locationSearchTargetsMobile = [
      ...locationSearchTargets,
      'MapPosition',
    ];

    const alertsContext = {
      currentTime: this.props.currentTime,
      getModesWithAlerts,
      feedIds: config.feedIds,
    };

    const showSpinner =
      (origin.type === 'CurrentLocation' && !origin.address) ||
      (destination.type === 'CurrentLocation' && !destination.address);
    const refPoint = getRefPoint(origin, destination, this.props.locationState);
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
      fontWeights,
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
      fontWeights,
      modeIconColors: config.colors.iconColors,
    };

    const transportModes = getTransportModes(config);
    const nearYouModes = getNearYouModes(config);

    const NearStops = CtrlPanel => {
      const btnWithoutLabel = nearYouModes.length > 0;
      const modeTitles = this.filterObject(
        transportModes,
        'availableForSelection',
        true,
      );
      const modes = btnWithoutLabel ? nearYouModes : Object.keys(modeTitles);

      return config.showNearYouButtons ? (
        <>
          <CtrlPanel.NearStopsAndRoutes
            modeArray={modes}
            urlPrefix={`/${PREFIX_NEARYOU}`}
            language={lang}
            showTitle
            alertsContext={alertsContext}
            origin={origin}
            omitLanguageUrl
            onClick={this.clickStopNearIcon}
            buttonStyle={
              btnWithoutLabel ? undefined : transportModes?.nearYouButton
            }
            title={btnWithoutLabel ? undefined : transportModes?.nearYouTitle}
            modes={btnWithoutLabel ? undefined : modeTitles}
            modeIconColors={config.colors.iconColors}
            fontWeights={fontWeights}
          />
        </>
      ) : (
        <></>
      );
    };

    const stopRouteSearch = isMobile => {
      if (config.showRouteSearch) {
        const title = !config.showNearYouButtons ? (
          <div className="stops-near-you-text">
            <h2>
              {' '}
              {intl.formatMessage({
                id: 'stop-near-you-title',
                defaultMessage: 'Stops and lines near you',
              })}
            </h2>
          </div>
        ) : (
          <></>
        );
        return isMobile ? (
          <>
            {title}
            <StopRouteSearch {...stopRouteSearchProps} />
          </>
        ) : (
          <>
            {title}
            <div className="stop-route-search-container">
              <StopRouteSearch isMobile {...stopRouteSearchProps} />
            </div>
          </>
        );
      }
      return <></>;
    };

    return (
      <LazilyLoad modules={modules}>
        {({
          CtrlPanel,
          TrafficNowLink,
          OverlayWithSpinner,
          FavouritesContainer,
          DatetimepickerContainer,
        }) =>
          breakpoint === 'large' ? (
            <div
              className={`front-page flex-vertical ${
                showSpinner && `blurred`
              } fullscreen bp-${breakpoint}`}
            >
              <div
                style={{ display: 'block' }}
                className="scrollable-content-wrapper momentum-scroll"
              >
                <h1 className="sr-only">
                  <FormattedMessage
                    id="index.title"
                    default="Journey Planner"
                  />
                </h1>
                <CtrlPanel
                  instance="hsl"
                  language={lang}
                  origin={origin}
                  position="left"
                  fontWeights={fontWeights}
                >
                  <span className="sr-only">
                    <FormattedMessage
                      id="search-fields.sr-instructions"
                      defaultMessage="The search is triggered automatically when origin and destination are set. Changing any search parameters triggers a new search"
                    />
                  </span>
                  <LocationSearch
                    targets={locationSearchTargets}
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
                  <>{NearStops(CtrlPanel)}</>
                  {stopRouteSearch(false)}
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
                <CtrlPanel
                  instance="hsl"
                  language={lang}
                  position="bottom"
                  fontWeights={fontWeights}
                >
                  <LocationSearch
                    disableAutoFocus
                    isMobile
                    targets={locationSearchTargetsMobile}
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
                  <>{NearStops(CtrlPanel)}</>
                  {stopRouteSearch(false)}
                  <CtrlPanel.SeparatorLine usePaddingBottom20 />
                  {!trafficNowLink ||
                    (trafficNowLink[lang] !== '' && (
                      <TrafficNowLink
                        lang={lang}
                        handleClick={this.trafficNowHandler}
                        fontWeights={fontWeights}
                      />
                    ))}
                </CtrlPanel>
              </div>
            </div>
          )
        }
      </LazilyLoad>
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
      isEqual(nextProps.query, props.query) &&
      isEqual(nextProps.locationState, props.locationState)
    );
  },
)(IndexPage);

const IndexPageWithBreakpoint = withBreakpoint(Index);

const IndexPageWithStores = connectToStores(
  IndexPageWithBreakpoint,
  [
    'OriginStore',
    'DestinationStore',
    'TimeStore',
    'PreferencesStore',
    'PositionStore',
  ],
  (context, props) => {
    const origin = context.getStore('OriginStore').getOrigin();
    const destination = context.getStore('DestinationStore').getDestination();
    const locationState = context.getStore('PositionStore').getLocationState();
    const { location } = props.match;
    const newProps = {};
    const { query } = location;
    const { favouriteModalAction, fromMap } = query;
    newProps.locationState = locationState;

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

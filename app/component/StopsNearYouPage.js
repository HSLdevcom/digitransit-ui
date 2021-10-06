import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { graphql, ReactRelayContext, QueryRenderer } from 'react-relay';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Modal from '@hsl-fi/modal';
import DTAutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import DTIcon from '@digitransit-component/digitransit-component-icon';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import { dtLocationShape } from '../util/shapes';
import Icon from './Icon';
import DesktopView from './DesktopView';
import MobileView from './MobileView';
import withBreakpoint, { DesktopOrMobile } from '../util/withBreakpoint';
import { otpToLocation, addressToItinerarySearch } from '../util/otpStrings';
import { isKeyboardSelectionEvent } from '../util/browser';
import Loading from './Loading';
import PrioritizedStopsNearYou from './PrioritizedStopsNearYou';
import {
  checkPositioningPermission,
  startLocationWatch,
} from '../action/PositionActions';
import DisruptionBanner from './DisruptionBanner';
import StopsNearYouSearch from './StopsNearYouSearch';
import {
  getGeolocationState,
  getReadMessageIds,
  setReadMessageIds,
} from '../store/localStorage';
import withSearchContext from './WithSearchContext';
import { PREFIX_NEARYOU } from '../util/path';
import StopsNearYouContainer from './StopsNearYouContainer';
import SwipeableTabs from './SwipeableTabs';
import StopsNearYouFavorites from './StopsNearYouFavorites';
import StopsNearYouMapContainer from './StopsNearYouMapContainer';
import StopsNearYouFavoritesMapContainer from './StopsNearYouFavoritesMapContainer';
import { mapLayerShape } from '../store/MapLayerStore';
import {
  getCityBikeNetworkConfig,
  getCityBikeNetworkId,
} from '../util/citybikes';
import { getMapLayerOptions } from '../util/mapLayerUtils';
import {
  getTransportModes,
  getNearYouModes,
  showCityBikes,
} from '../util/modeUtils';

// component initialization phases
const PH_START = 'start';
const PH_SEARCH = 'search';
const PH_SEARCH_GEOLOCATION = 'search+geolocation';
const PH_GEOLOCATIONING = 'geolocationing';
const PH_USEDEFAULTPOS = 'usedefaultpos';
const PH_USEGEOLOCATION = 'usegeolocation';
const PH_USEMAPCENTER = 'usemapcenter';

const PH_SHOWSEARCH = [PH_SEARCH, PH_SEARCH_GEOLOCATION]; // show modal
const PH_READY = [PH_USEDEFAULTPOS, PH_USEGEOLOCATION, PH_USEMAPCENTER]; // render the actual page

const DTAutoSuggestWithSearchContext = withSearchContext(DTAutoSuggest);

class StopsNearYouPage extends React.Component {
  // eslint-disable-line
  static contextTypes = {
    config: PropTypes.object.isRequired,
    executeAction: PropTypes.func.isRequired,
    headers: PropTypes.object.isRequired,
    getStore: PropTypes.func,
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
  };

  static propTypes = {
    breakpoint: PropTypes.string.isRequired,
    relayEnvironment: PropTypes.object.isRequired,
    position: dtLocationShape.isRequired,
    lang: PropTypes.string.isRequired,
    match: matchShape.isRequired,
    favouriteStopIds: PropTypes.array.isRequired,
    favouriteStationIds: PropTypes.array.isRequired,
    favouriteBikeStationIds: PropTypes.array.isRequired,
    mapLayers: mapLayerShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      phase: PH_START,
      centerOfMap: null,
      centerOfMapChanged: false,
      favouriteStopIds: props.favouriteStopIds,
      favouriteStationIds: props.favouriteStationIds,
      favouriteBikeStationIds: props.favouriteBikeStationIds,
      showCityBikeTeaser: true,
      searchPosition: {},
      mapLayerOptions: null,
      // eslint-disable-next-line react/no-unused-state
      resultsLoaded: false,
    };
  }

  componentDidMount() {
    const readMessageIds = getReadMessageIds();
    const showCityBikeTeaser = !readMessageIds.includes('citybike_teaser');
    if (this.context.config.map.showLayerSelector) {
      const { mode } = this.props.match.params;
      const mapLayerOptions = getMapLayerOptions({
        lockedMapLayers: ['vehicles', 'citybike', 'stop'],
        selectedMapLayers: ['vehicles', mode.toLowerCase()],
      });
      this.setState({ showCityBikeTeaser, mapLayerOptions });
    } else {
      this.setState({ showCityBikeTeaser });
    }
    checkPositioningPermission().then(permission => {
      const { origin, place } = this.props.match.params;
      const savedPermission = getGeolocationState();
      const { state } = permission;
      const newState = {};

      if (origin) {
        newState.searchPosition = otpToLocation(origin);
      } else {
        newState.searchPosition = this.context.config.defaultEndpoint;
      }
      if (savedPermission === 'unknown') {
        if (!origin) {
          // state = 'error' means no permission api, so we assume geolocation will work
          if (state === 'prompt' || state === 'granted' || state === 'error') {
            newState.phase = PH_SEARCH_GEOLOCATION;
          } else {
            newState.phase = PH_SEARCH;
          }
        } else {
          newState.phase = PH_USEDEFAULTPOS;
        }
      } else if (
        state === 'prompt' ||
        state === 'granted' ||
        (state === 'error' && savedPermission !== 'denied')
      ) {
        // reason to expect that geolocation will work
        newState.phase = PH_GEOLOCATIONING;
        this.context.executeAction(startLocationWatch);
      } else if (origin) {
        newState.phase = PH_USEDEFAULTPOS;
      } else if (state === 'error') {
        // No permission api.
        // Suggest geolocation, user may have changed permissions from browser settings
        newState.phase = PH_SEARCH_GEOLOCATION;
      } else {
        // Geolocationing is known to be denied. Provide search modal
        newState.phase = PH_SEARCH;
      }
      if (place !== 'POS') {
        newState.searchPosition = otpToLocation(place);
        newState.phase = PH_USEDEFAULTPOS;
      }
      this.setState(newState);
    });
  }

  componentDidUpdate = prevProps => {
    if (this.context.config.map.showLayerSelector) {
      const { mode } = this.props.match.params;
      const { mode: prevMode } = prevProps.match.params;
      if (mode !== prevMode) {
        this.setMapLayerOptions();
      }
    }
  };

  static getDerivedStateFromProps = (nextProps, prevState) => {
    let newState = null;
    if (
      (nextProps.match.params.mode !== 'FAVORITE' &&
        prevState.favouriteStopIds.length !==
          nextProps.favouriteStopIds.length) ||
      prevState.favouriteStationIds.length !==
        nextProps.favouriteStationIds.length ||
      prevState.favouriteBikeStationIds.length !==
        nextProps.favouriteBikeStationIds.length
    ) {
      newState = {
        favouriteStopIds: nextProps.favouriteStopIds,
        favouriteStationIds: nextProps.favouriteStationIds,
        favouriteBikeStationIds: nextProps.favouriteBikeStationIds,
      };
    }
    if (prevState.phase === PH_GEOLOCATIONING) {
      if (nextProps.position.locationingFailed) {
        newState = { phase: PH_USEDEFAULTPOS };
      } else if (nextProps.position.hasLocation) {
        newState = {
          phase: PH_USEGEOLOCATION,
          searchPosition: nextProps.position,
        };
      }
      return newState;
    }
    return newState;
  };

  setLoadState = () => {
    // trigger a state update in this component to force a rerender when stop data is received for the first time.
    // this fixes a bug where swipeable tabs were not keeping focusable elements up to date after receving stop data
    // and keyboard focus could be lost to hidden elements.
    // eslint-disable-next-line react/no-unused-state
    this.setState({ resultsLoaded: true });
  };

  setMapLayerOptions = () => {
    const { mode } = this.props.match.params;
    const mapLayerOptions = getMapLayerOptions({
      lockedMapLayers: ['vehicles', 'citybike', 'stop'],
      selectedMapLayers: ['vehicles', mode.toLowerCase()],
    });
    this.setState({ mapLayerOptions });
  };

  getQueryVariables = nearByMode => {
    const { searchPosition } = this.state;
    const { mode } = this.props.match.params;
    let placeTypes = 'STOP';
    let modes = nearByMode ? [nearByMode] : [mode];
    if (nearByMode === 'CITYBIKE') {
      placeTypes = 'BICYCLE_RENT';
      modes = ['BICYCLE'];
    }
    const prioritizedStops =
      this.context.config.prioritizedStopsNearYou[mode.toLowerCase()] || [];
    return {
      lat: searchPosition.lat,
      lon: searchPosition.lon,
      maxResults: 2000,
      first: this.context.config.maxNearbyStopAmount,
      maxDistance: this.context.config.maxNearbyStopDistance[
        mode.toLowerCase()
      ],
      filterByModes: modes,
      filterByPlaceTypes: placeTypes,
      omitNonPickups: this.context.config.omitNonPickups,
      feedIds: this.context.config.feedIds,
      prioritizedStopIds: prioritizedStops,
    };
  };

  setCenterOfMap = mapElement => {
    let location;
    if (!mapElement) {
      if (distance(this.state.searchPosition, this.props.position) > 100) {
        // user has pressed locate me after moving on the map via the search box
        return this.setState({
          centerOfMap: this.props.position,
          centerOfMapChanged: true,
        });
      }
      return this.setState({
        centerOfMap: this.props.position,
        centerOfMapChanged: false,
      });
    }
    if (this.props.breakpoint === 'large') {
      const centerOfMap = mapElement.leafletElement.getCenter();
      location = { lat: centerOfMap.lat, lon: centerOfMap.lng };
    } else {
      const drawer = document.getElementsByClassName('drawer-container')[0];
      const { scrollTop } = drawer;

      const height = (window.innerHeight * 0.9 - 24 - scrollTop) / 2;
      const width = window.innerWidth / 2;
      const point = mapElement.leafletElement.containerPointToLatLng([
        width,
        height,
      ]);
      location = { lat: point.lat, lon: point.lng };
    }
    if (distance(location, this.state.searchPosition) > 100) {
      // user has scrolled over 100 meters on the map
      return this.setState({
        centerOfMap: location,
        centerOfMapChanged: true,
      });
    }
    return this.setState({
      centerOfMap: location,
      centerOfMapChanged: false,
    });
  };

  positionChanged = () => {
    const { searchPosition, centerOfMap } = this.state;
    if (!searchPosition.lat) {
      return false;
    }
    if (
      centerOfMap &&
      searchPosition.lat === centerOfMap.lat &&
      searchPosition.lon === centerOfMap.lon
    ) {
      return false;
    }
    const position = this.getPosition();
    return distance(searchPosition, position) > 100;
  };

  updateLocation = () => {
    const { centerOfMap } = this.state;
    const { mode } = this.props.match.params;
    if (centerOfMap && centerOfMap.lat && centerOfMap.lon) {
      let phase = PH_USEMAPCENTER;
      let type = 'CenterOfMap';
      if (centerOfMap.type === 'CurrentLocation') {
        phase = PH_USEGEOLOCATION;
        type = centerOfMap.type;
        const path = `/${PREFIX_NEARYOU}/${mode}/POS`;
        this.context.router.replace({
          ...this.props.match.location,
          pathname: path,
        });
      } else {
        const path = `/${PREFIX_NEARYOU}/${mode}/${addressToItinerarySearch(
          centerOfMap,
        )}`;
        this.context.router.replace({
          ...this.props.match.location,
          pathname: path,
        });
      }
      return this.setState({
        searchPosition: { ...centerOfMap, type },
        centerOfMapChanged: false,
        phase,
      });
    }
    return this.setState({ searchPosition: this.getPosition() });
  };

  getNearByStopModes = () => {
    const transportModes = getTransportModes(this.context.config);
    const nearYouModes = getNearYouModes(this.context.config);
    const configNearByYouModes = nearYouModes.length
      ? nearYouModes
      : Object.keys(transportModes).filter(
          mode => transportModes[mode].availableForSelection,
        );
    const nearByStopModes = configNearByYouModes.map(nearYouMode =>
      nearYouMode.toUpperCase(),
    );
    return nearByStopModes;
  };

  getPosition = () => {
    return this.state.phase === PH_USEDEFAULTPOS
      ? this.state.searchPosition
      : this.props.position;
  };

  onSwipe = e => {
    const nearByStopModes = this.getNearByStopModes();
    const { mode } = this.props.match.params;
    const newMode = nearByStopModes[e];
    const paramArray = this.props.match.location.pathname.split(mode);
    const pathParams = paramArray.length > 1 ? paramArray[1] : '/POS';
    const path = `/${PREFIX_NEARYOU}/${newMode}${pathParams}`;
    this.context.router.replace({
      ...this.props.match.location,
      pathname: path,
    });
  };

  refetchButton = nearByMode => {
    const { mode } = this.props.match.params;
    const modeClass = nearByMode || mode;
    return (
      <div className="nearest-stops-update-container">
        <FormattedMessage id="nearest-stops-updated-location" />
        <button
          type="button"
          aria-label={this.context.intl.formatMessage({
            id: 'show-more-stops-near-you',
            defaultMessage: 'Load more nearby stops',
          })}
          className="update-stops-button"
          onClick={this.updateLocation}
        >
          <Icon img="icon-icon_update" />
          <FormattedMessage
            id="nearest-stops-update-location"
            defaultMessage="Update stops"
            values={{
              mode: (
                <FormattedMessage
                  id={`nearest-stops-${modeClass.toLowerCase()}`}
                />
              ),
            }}
          />
        </button>
      </div>
    );
  };

  noFavorites = () => {
    return (
      !this.state.favouriteStopIds.length &&
      !this.state.favouriteStationIds.length &&
      !this.state.favouriteBikeStationIds.length
    );
  };

  handleCityBikeTeaserClose = () => {
    const readMessageIds = getReadMessageIds() || [];
    readMessageIds.push('citybike_teaser');
    setReadMessageIds(readMessageIds);
    this.setState({ showCityBikeTeaser: false });
  };

  renderContent = () => {
    const { centerOfMapChanged } = this.state;
    const { mode } = this.props.match.params;
    const noFavorites = mode === 'FAVORITE' && this.noFavorites();
    const renderRefetchButton =
      (centerOfMapChanged || this.positionChanged()) && !noFavorites;
    const nearByStopModes = this.getNearByStopModes();
    const index = nearByStopModes.indexOf(mode);
    const tabs = nearByStopModes.map(nearByStopMode => {
      const renderSearch =
        nearByStopMode !== 'FERRY' && nearByStopMode !== 'FAVORITE';
      const renderDisruptionBanner = nearByStopMode !== 'CITYBIKE';
      if (nearByStopMode === 'FAVORITE') {
        const noFavs = this.noFavorites();
        return (
          <div
            key={nearByStopMode}
            className={`stops-near-you-page swipeable-tab ${
              nearByStopMode !== mode && 'inactive'
            }`}
            aria-hidden={nearByStopMode !== mode}
          >
            {renderRefetchButton && this.refetchButton()}
            <StopsNearYouFavorites
              searchPosition={this.state.searchPosition}
              match={this.props.match}
              favoriteStops={this.state.favouriteStopIds}
              favoriteStations={this.state.favouriteStationIds}
              favoriteBikeRentalStationIds={this.state.favouriteBikeStationIds}
              noFavorites={noFavs}
            />
          </div>
        );
      }

      return (
        <div
          className={`swipeable-tab ${nearByStopMode !== mode && 'inactive'}`}
          key={nearByStopMode}
          aria-hidden={nearByStopMode !== mode}
        >
          <QueryRenderer
            query={graphql`
              query StopsNearYouPageContentQuery(
                $lat: Float!
                $lon: Float!
                $filterByPlaceTypes: [FilterPlaceType]
                $filterByModes: [Mode]
                $first: Int!
                $maxResults: Int!
                $maxDistance: Int!
                $omitNonPickups: Boolean
                $feedIds: [String!]
              ) {
                stopPatterns: viewer {
                  ...StopsNearYouContainer_stopPatterns
                  @arguments(
                    lat: $lat
                    lon: $lon
                    filterByPlaceTypes: $filterByPlaceTypes
                    filterByModes: $filterByModes
                    first: $first
                    maxResults: $maxResults
                    maxDistance: $maxDistance
                    omitNonPickups: $omitNonPickups
                  )
                }
                alerts: alerts(feeds: $feedIds, severityLevel: [SEVERE]) {
                  ...DisruptionBanner_alerts
                }
              }
            `}
            variables={this.getQueryVariables(nearByStopMode)}
            environment={this.props.relayEnvironment}
            render={({ props }) => {
              const { cityBike } = this.context.config;
              // Use buy instructions if available
              const cityBikeBuyUrl = cityBike.buyUrl;
              let cityBikeNetworkUrl;
              // Use general information about using city bike, if one network config is available
              if (Object.keys(cityBike.networks).length === 1) {
                cityBikeNetworkUrl = getCityBikeNetworkConfig(
                  getCityBikeNetworkId(Object.keys(cityBike.networks)),
                  this.context.config,
                ).url;
              }
              const prioritizedStops = this.context.config
                .prioritizedStopsNearYou[nearByStopMode.toLowerCase()];
              return (
                <div className="stops-near-you-page">
                  {renderDisruptionBanner && (
                    <DisruptionBanner
                      alerts={(props && props.alerts) || []}
                      mode={nearByStopMode}
                      trafficNowLink={this.context.config.trafficNowLink}
                    />
                  )}
                  {renderSearch && (
                    <StopsNearYouSearch
                      mode={nearByStopMode}
                      breakpoint={this.props.breakpoint}
                      lang={this.props.lang}
                    />
                  )}
                  {this.state.showCityBikeTeaser &&
                    nearByStopMode === 'CITYBIKE' &&
                    (cityBikeBuyUrl || cityBikeNetworkUrl) && (
                      <div className="citybike-use-disclaimer">
                        <div className="disclaimer-header">
                          <FormattedMessage id="citybike-start-using" />
                          <div
                            className="disclaimer-close"
                            aria-label="Sulje kaupunkipyöräoikeuden ostaminen"
                            tabIndex="0"
                            onKeyDown={e => {
                              if (
                                isKeyboardSelectionEvent(e) &&
                                (e.keyCode === 13 || e.keyCode === 32)
                              ) {
                                this.handleCityBikeTeaserClose();
                              }
                            }}
                            onClick={this.handleCityBikeTeaserClose}
                            role="button"
                          >
                            <Icon
                              color={this.context.config.colors.primary}
                              img="icon-icon_close"
                            />
                          </div>
                        </div>
                        <div className="disclaimer-content">
                          {cityBikeBuyUrl ? (
                            <FormattedMessage id="citybike-buy-season" />
                          ) : (
                            <a
                              className="external-link-citybike"
                              href={cityBikeNetworkUrl[this.props.lang]}
                            >
                              <FormattedMessage id="citybike-start-using-info" />{' '}
                            </a>
                          )}
                          {cityBikeBuyUrl && (
                            <a
                              href={cityBikeBuyUrl[this.props.lang]}
                              className="disclaimer-close-button-container"
                              tabIndex="0"
                              role="button"
                              onKeyDown={e => {
                                if (
                                  isKeyboardSelectionEvent(e) &&
                                  (e.keyCode === 13 || e.keyCode === 32)
                                ) {
                                  window.location =
                                    cityBikeBuyUrl[this.props.lang];
                                }
                              }}
                            >
                              <div
                                aria-label="Siirry ostamaan kaupunkipyöräoikeutta."
                                className="disclaimer-close-button"
                              >
                                <FormattedMessage id="buy" />
                              </div>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                  {renderRefetchButton && this.refetchButton(nearByStopMode)}
                  {prioritizedStops?.length && (
                    <QueryRenderer
                      query={graphql`
                        query StopsNearYouPagePrioritizedStopsQuery(
                          $stopIds: [String!]!
                        ) {
                          stops: stops(ids: $stopIds) {
                            ...PrioritizedStopsNearYou_stops
                          }
                        }
                      `}
                      variables={{
                        stopIds: prioritizedStops,
                      }}
                      environment={this.props.relayEnvironment}
                      render={res => {
                        if (res.props) {
                          return (
                            <PrioritizedStopsNearYou stops={res.props.stops} />
                          );
                        }
                        return null;
                      }}
                    />
                  )}
                  {!props && (
                    <div className="stops-near-you-spinner-container">
                      <Loading />
                    </div>
                  )}
                  {props && (
                    <StopsNearYouContainer
                      prioritizedStops={prioritizedStops}
                      setLoadState={this.setLoadState}
                      match={this.props.match}
                      stopPatterns={props.stopPatterns}
                      position={this.state.searchPosition}
                      withSeparator={!renderSearch}
                    />
                  )}
                </div>
              );
            }}
          />
        </div>
      );
    });

    if (tabs.length > 1) {
      return (
        <SwipeableTabs
          tabIndex={index}
          onSwipe={this.onSwipe}
          tabs={tabs}
          classname={
            this.props.breakpoint === 'large' ? 'swipe-desktop-view' : ''
          }
          ariaFrom="swipe-stops-near-you"
          ariaFromHeader="swipe-stops-near-you-header"
        />
      );
    }
    return tabs[0];
  };

  renderMap = () => {
    const { mode } = this.props.match.params;
    if (mode === 'FAVORITE') {
      return (
        <QueryRenderer
          query={graphql`
            query StopsNearYouPageFavoritesMapQuery(
              $stopIds: [String!]!
              $stationIds: [String!]!
              $bikeRentalStationIds: [String!]!
            ) {
              stops: stops(ids: $stopIds) {
                ...StopsNearYouFavoritesMapContainer_stops
              }
              stations: stations(ids: $stationIds) {
                ...StopsNearYouFavoritesMapContainer_stations
              }
              bikeStations: bikeRentalStations(ids: $bikeRentalStationIds) {
                ...StopsNearYouFavoritesMapContainer_bikeStations
              }
            }
          `}
          variables={{
            stopIds: this.state.favouriteStopIds,
            stationIds: this.state.favouriteStationIds,
            bikeRentalStationIds: this.state.favouriteBikeStationIds,
          }}
          environment={this.props.relayEnvironment}
          render={({ props }) => {
            if (props) {
              return (
                <StopsNearYouFavoritesMapContainer
                  position={this.state.searchPosition}
                  match={this.props.match}
                  onEndNavigation={this.setCenterOfMap}
                  onMapTracking={this.setCenterOfMap}
                  showWalkRoute={
                    this.state.phase === PH_USEGEOLOCATION ||
                    this.state.phase === PH_USEDEFAULTPOS
                  }
                  stops={props.stops}
                  mapLayers={this.props.mapLayers}
                  stations={props.stations}
                  bikeStations={props.bikeStations}
                  favouriteIds={[
                    ...this.state.favouriteStopIds,
                    ...this.state.favouriteStationIds,
                    ...this.state.favouriteBikeStationIds,
                  ]}
                  breakpoint={this.props.breakpoint}
                />
              );
            }
            return undefined;
          }}
        />
      );
    }
    const filteredMapLayers = {
      ...this.props.mapLayers,
      citybike: mode === 'CITYBIKE',
      citybikeOverrideMinZoom: mode === 'CITYBIKE',
    };
    if (!this.context.config.map.showLayerSelector) {
      filteredMapLayers.stop = {};
      if (mode !== 'CITYBIKE') {
        filteredMapLayers.stop[mode.toLowerCase()] = true;
      }
    }
    return (
      <QueryRenderer
        query={graphql`
          query StopsNearYouPageStopsQuery(
            $lat: Float!
            $lon: Float!
            $filterByPlaceTypes: [FilterPlaceType]
            $filterByModes: [Mode]
            $first: Int!
            $maxResults: Int!
            $maxDistance: Int!
            $omitNonPickups: Boolean
            $prioritizedStopIds: [String!]!
          ) {
            stops: viewer {
              ...StopsNearYouMapContainer_stopsNearYou
              @arguments(
                lat: $lat
                lon: $lon
                filterByPlaceTypes: $filterByPlaceTypes
                filterByModes: $filterByModes
                first: $first
                maxResults: $maxResults
                maxDistance: $maxDistance
                omitNonPickups: $omitNonPickups
              )
            }
            prioritizedStops: stops(ids: $prioritizedStopIds) {
              ...StopsNearYouMapContainer_prioritizedStopsNearYou
            }
          }
        `}
        variables={this.getQueryVariables(mode)}
        environment={this.props.relayEnvironment}
        render={({ props }) => {
          if (props) {
            return (
              <StopsNearYouMapContainer
                position={this.state.searchPosition}
                stopsNearYou={props.stops}
                prioritizedStopsNearYou={props.prioritizedStops}
                match={this.props.match}
                mapLayers={filteredMapLayers}
                mapLayerOptions={this.state.mapLayerOptions}
                showWalkRoute={
                  this.state.phase === PH_USEGEOLOCATION ||
                  this.state.phase === PH_USEDEFAULTPOS
                }
                onEndNavigation={this.setCenterOfMap}
                onMapTracking={this.setCenterOfMap}
                breakpoint={this.props.breakpoint}
              />
            );
          }
          return null;
        }}
      />
    );
  };

  handleClose = () => {
    this.setState({ phase: PH_USEDEFAULTPOS });
  };

  handleStartGeolocation = () => {
    this.context.executeAction(startLocationWatch);
    this.setState({ phase: PH_GEOLOCATIONING });
  };

  selectHandler = item => {
    const { mode } = this.props.match.params;
    const path = `/${PREFIX_NEARYOU}/${mode}/${addressToItinerarySearch(item)}`;
    this.context.router.replace({
      ...this.props.match.location,
      pathname: path,
    });
    this.setState({
      phase: PH_USEDEFAULTPOS,
      searchPosition: item,
      centerOfMap: null,
      centerOfMapChanged: false,
    });
  };

  renderSearchBox = () => {
    return (
      <div className="stops-near-you-location-search">
        {this.renderAutoSuggestField(true)}
      </div>
    );
  };

  renderAutoSuggestField = onMap => {
    const isMobile = this.props.breakpoint !== 'large';
    const searchProps = {
      id: 'origin-stop-near-you',
      placeholder: 'origin',
      translatedPlaceholder: onMap
        ? this.context.intl.formatMessage({ id: 'move-on-map' })
        : undefined,
      mobileLabel: onMap
        ? this.context.intl.formatMessage({ id: 'position' })
        : undefined,
      inputClassName: onMap ? 'origin-stop-near-you-selector' : undefined,
    };
    const targets = ['Locations', 'Stops'];
    if (showCityBikes(this.context.config.cityBike?.networks)) {
      targets.push('BikeRentalStations');
    }
    return (
      <DTAutoSuggestWithSearchContext
        appElement="#app"
        icon="search"
        sources={['History', 'Datasource', 'Favourite']}
        targets={targets}
        value=""
        lang={this.props.lang}
        mode={this.props.match.params.mode}
        isMobile={isMobile}
        selectHandler={this.selectHandler} // prop for context handler
        {...searchProps}
      />
    );
  };

  renderDialogModal = () => {
    return (
      <Modal
        appElement="#app"
        contentLabel="content label"
        closeButtonLabel={this.context.intl.formatMessage({
          id: 'close',
        })}
        variant="small"
        isOpen
        onCrossClick={this.handleClose}
      >
        <div className="modal-desktop-container">
          <div className="modal-desktop-top">
            <div className="modal-desktop-header">
              <FormattedMessage id="stop-near-you-modal-header" />
            </div>
          </div>
          <div className="modal-desktop-text">
            <FormattedMessage id="stop-near-you-modal-info" />
          </div>
          <div className="modal-desktop-text title">
            <FormattedMessage id="origin" />
          </div>
          <div className="modal-desktop-main">
            <div className="modal-desktop-location-search">
              {this.renderAutoSuggestField()}
            </div>
          </div>
          <div className="modal-desktop-text title2">
            <FormattedMessage id="stop-near-you-modal-grant-permission" />
          </div>
          {this.state.phase === PH_SEARCH_GEOLOCATION && (
            <div className="modal-desktop-buttons">
              <button
                type="submit"
                className="modal-desktop-button save"
                onClick={() => this.handleStartGeolocation()}
              >
                <DTIcon img="locate" height={1.375} width={1.375} />
                <FormattedMessage id="use-own-position" />
              </button>
            </div>
          )}
          {this.state.phase === PH_SEARCH && (
            <div className="modal-desktop-text info">
              <FormattedMessage id="stop-near-you-modal-grant-permission-info" />
            </div>
          )}
        </div>
      </Modal>
    );
  };

  render() {
    const { mode } = this.props.match.params;
    const { phase } = this.state;
    const nearByStopModes = this.getNearByStopModes();

    if (PH_SHOWSEARCH.includes(phase)) {
      return <div>{this.renderDialogModal()}</div>;
    }
    if (PH_READY.includes(phase)) {
      return (
        <DesktopOrMobile
          desktop={() => (
            <DesktopView
              title={
                mode === 'FAVORITE' ? (
                  <FormattedMessage id="nearest-favorites" />
                ) : (
                  <FormattedMessage
                    id="nearest"
                    defaultMessage="Stops near you"
                    values={{
                      mode: (
                        <FormattedMessage
                          id={`nearest-stops-${mode.toLowerCase()}`}
                        />
                      ),
                    }}
                  />
                )
              }
              bckBtnFallback="back"
              content={this.renderContent()}
              scrollable={nearByStopModes.length === 1}
              map={
                <>
                  {this.renderSearchBox()}
                  {this.renderMap()}
                </>
              }
            />
          )}
          mobile={() => (
            <MobileView
              content={this.renderContent()}
              map={this.renderMap()}
              searchBox={this.renderSearchBox()}
            />
          )}
        />
      );
    }
    return <Loading />;
  }
}

const StopsNearYouPageWithBreakpoint = withBreakpoint(props => (
  <ReactRelayContext.Consumer>
    {({ environment }) => (
      <StopsNearYouPage {...props} relayEnvironment={environment} />
    )}
  </ReactRelayContext.Consumer>
));

const PositioningWrapper = connectToStores(
  StopsNearYouPageWithBreakpoint,
  ['PositionStore', 'PreferencesStore', 'FavouriteStore', 'MapLayerStore'],
  (context, props) => {
    const favouriteStopIds = context
      .getStore('FavouriteStore')
      .getStopsAndStations()
      .filter(stop => stop.type === 'stop')
      .map(stop => stop.gtfsId);
    const favouriteStationIds = context
      .getStore('FavouriteStore')
      .getStopsAndStations()
      .filter(stop => stop.type === 'station')
      .map(stop => stop.gtfsId);
    let favouriteBikeStationIds = [];
    if (showCityBikes(context.config.cityBike?.networks)) {
      favouriteBikeStationIds = context
        .getStore('FavouriteStore')
        .getBikeRentalStations()
        .map(station => station.stationId);
    }
    return {
      ...props,
      position: context.getStore('PositionStore').getLocationState(),
      lang: context.getStore('PreferencesStore').getLanguage(),
      mapLayers: context
        .getStore('MapLayerStore')
        .getMapLayers({ notThese: ['vehicles'] }),
      favouriteStopIds,
      favouriteBikeStationIds,
      favouriteStationIds,
    };
  },
);

PositioningWrapper.contextTypes = {
  getStore: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};

export {
  PositioningWrapper as default,
  StopsNearYouPageWithBreakpoint as Component,
};

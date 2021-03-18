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
import { MAPSTATES } from '../util/stopsNearYouUtils';
import Loading from './Loading';
import {
  checkPositioningPermission,
  startLocationWatch,
} from '../action/PositionActions';
import DisruptionBanner from './DisruptionBanner';
import StopsNearYouSearch from './StopsNearYouSearch';
import { getGeolocationState } from '../store/localStorage';
import withSearchContext from './WithSearchContext';
import { PREFIX_NEARYOU } from '../util/path';
import StopsNearYouContainer from './StopsNearYouContainer';
import SwipeableTabs from './SwipeableTabs';
import StopsNearYouFavorites from './StopsNearYouFavorites';
import StopsNearYouMapContainer from './StopsNearYouMapContainer';
import StopsNearYouFavoritesMapContainer from './StopsNearYouFavoritesMapContainer';

// component initialization phases
const PH_START = 'start';
const PH_SEARCH = 'search';
const PH_SEARCH_GEOLOCATION = 'search+geolocation';
const PH_GEOLOCATIONING = 'geolocationing';
const PH_USEDEFAULTPOS = 'usedefaultpos';
const PH_USEGEOLOCATION = 'usegeolocation';

const PH_SHOWSEARCH = [PH_SEARCH, PH_SEARCH_GEOLOCATION]; // show modal
const PH_READY = [PH_USEDEFAULTPOS, PH_USEGEOLOCATION]; // render the actual page

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
  };

  constructor(props) {
    super(props);
    this.state = {
      phase: PH_START,
      centerOfMap: null,
      centerOfMapChanged: false,
      mapState: MAPSTATES.FITBOUNDSTOSTARTLOCATION,
      favouriteStopIds: props.favouriteStopIds,
      favouriteStationIds: props.favouriteStationIds,
      favouriteBikeStationIds: props.favouriteBikeStationIds,
    };
  }

  componentDidMount() {
    checkPositioningPermission().then(permission => {
      const { origin } = this.props.match.params;
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
      this.setState(newState);
    });
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    let newState = null;
    if (
      nextProps.match.params.mode !== 'FAVORITE' &&
      (prevState.favouriteStopIds.length !==
        nextProps.favouriteStopIds.length ||
        prevState.favouriteStationIds.length !==
          nextProps.favouriteStationIds.length ||
        prevState.favouriteBikeStationIds.length !==
          nextProps.favouriteBikeStationIds.length)
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

  getQueryVariables = nearByMode => {
    const { searchPosition } = this.state;
    const { mode } = this.props.match.params;
    let placeTypes = 'STOP';
    let modes = nearByMode ? [nearByMode] : [mode];
    if (nearByMode === 'CITYBIKE') {
      placeTypes = 'BICYCLE_RENT';
      modes = ['BICYCLE'];
    }
    return {
      lat: searchPosition.lat,
      lon: searchPosition.lon,
      maxResults: 2000,
      first: this.context.config.maxNearbyStopAmount,
      maxDistance: this.context.config.maxNearbyStopDistance,
      filterByModes: modes,
      filterByPlaceTypes: placeTypes,
      omitNonPickups: this.context.config.omitNonPickups,
    };
  };

  setCenterOfMap = mapElement => {
    let location;
    if (!mapElement) {
      if (distance(this.state.searchPosition, this.props.position) > 100) {
        return this.setState({
          centerOfMap: this.props.position,
          centerOfMapChanged: true,
          mapState: MAPSTATES.FITBOUNDSTOCENTER,
        });
      }
      return this.setState({
        centerOfMap: this.props.position,
        centerOfMapChanged: false,
        mapState: MAPSTATES.FITBOUNDSTOCENTER,
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
    return this.setState({
      centerOfMap: location,
      centerOfMapChanged: true,
      mapState: MAPSTATES.HUMANSCROLL,
    });
  };

  positionChanged = () => {
    const { searchPosition, centerOfMap } = this.state;
    if (!searchPosition) {
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

  centerOfMapChanged = () => {
    const position = this.getPosition();
    const { centerOfMap, searchPosition } = this.state;
    if (
      centerOfMap &&
      searchPosition &&
      searchPosition.lat === centerOfMap.lat &&
      searchPosition.lon === centerOfMap.lon
    ) {
      return false;
    }
    if (centerOfMap && centerOfMap.lat && centerOfMap.lon) {
      return distance(centerOfMap, position) > 100;
    }
    return false;
  };

  updateLocation = () => {
    const { centerOfMap } = this.state;
    if (centerOfMap && centerOfMap.lat && centerOfMap.lon) {
      let mapState = MAPSTATES.FITBOUNDSTOSEARCHPOSITION;
      let type = 'CenterOfMap';
      if (centerOfMap.type === 'CurrentLocation') {
        mapState = MAPSTATES.FITBOUNDSTOSTARTLOCATION;
        type = centerOfMap.type;
      }
      return this.setState({
        searchPosition: { ...centerOfMap, type },
        centerOfMapChanged: false,
        mapState,
      });
    }
    return this.setState({ searchPosition: this.getPosition() });
  };

  getNearByStopModes = () => {
    const configNearByYouModes = this.context.config.nearYouModes.length
      ? this.context.config.nearYouModes
      : Object.keys(this.context.config.transportModes).filter(
          mode =>
            this.context.config.transportModes[mode].availableForSelection,
        );

    if (!configNearByYouModes.includes('favorite')) {
      configNearByYouModes.unshift('favorite');
    }
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

  renderContent = () => {
    const { centerOfMapChanged } = this.state;
    const { mode } = this.props.match.params;
    const renderDisruptionBanner = mode !== 'CITYBIKE';
    const renderSearch = mode !== 'FERRY' && mode !== 'FAVORITE';
    const noFavorites = mode === 'FAVORITE' && this.noFavorites();
    const renderRefetchButton =
      (centerOfMapChanged || this.positionChanged()) && !noFavorites;
    const nearByStopModes = this.getNearByStopModes();
    const index = nearByStopModes.indexOf(mode);
    const tabs = nearByStopModes.map(nearByStopMode => {
      if (nearByStopMode === 'FAVORITE') {
        const noFavs = this.noFavorites();
        return (
          <div
            className={`stops-near-you-page swipeable-tab ${
              nearByStopMode !== mode && 'inactive'
            }`}
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
                alerts: alerts(severityLevel: [SEVERE]) {
                  ...DisruptionBanner_alerts
                }
              }
            `}
            variables={this.getQueryVariables(nearByStopMode)}
            environment={this.props.relayEnvironment}
            render={({ props }) => {
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
                  {renderRefetchButton && this.refetchButton(nearByStopMode)}
                  {!props && (
                    <div className="stops-near-you-spinner-container">
                      <Loading />
                    </div>
                  )}
                  {props && (
                    <StopsNearYouContainer
                      match={this.props.match}
                      stopPatterns={props.stopPatterns}
                      position={this.state.searchPosition}
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
                  centerOfMap={this.state.centerOfMap}
                  match={this.props.match}
                  setCenterOfMap={this.setCenterOfMap}
                  mapState={this.state.mapState}
                  stops={props.stops}
                  stations={props.stations}
                  bikeStations={props.bikeStations}
                  favouriteIds={[
                    ...this.state.favouriteStopIds,
                    ...this.state.favouriteStationIds,
                    ...this.state.favouriteBikeStationIds,
                  ]}
                />
              );
            }
            return undefined;
          }}
        />
      );
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
          }
        `}
        variables={this.getQueryVariables(mode)}
        environment={this.props.relayEnvironment}
        render={({ props }) => {
          if (props) {
            return (
              <StopsNearYouMapContainer
                position={this.state.searchPosition}
                centerOfMap={this.state.centerOfMap}
                stopsNearYou={props.stops}
                match={this.props.match}
                mapState={this.state.mapState}
                setCenterOfMap={this.setCenterOfMap}
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
    const path = `/${PREFIX_NEARYOU}/${mode}/POS/${addressToItinerarySearch(
      item,
    )}`;
    this.context.router.replace({
      ...this.props.match.location,
      pathname: path,
    });
    this.setState({
      phase: PH_USEDEFAULTPOS,
      searchPosition: item,
      centerOfMap: null,
      centerOfMapChanged: false,
      mapState: MAPSTATES.FITBOUNDSTOSTARTLOCATION,
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
    if (
      this.context.config.cityBike &&
      this.context.config.cityBike.showCityBikes
    ) {
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
              scrollable
              bckBtnFallback="back"
              content={this.renderContent()}
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
  ['PositionStore', 'PreferencesStore', 'FavouriteStore'],
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
    if (context.config.cityBike && context.config.cityBike.showCityBikes) {
      favouriteBikeStationIds = context
        .getStore('FavouriteStore')
        .getBikeRentalStations()
        .map(station => station.stationId);
    }
    return {
      ...props,
      position: context.getStore('PositionStore').getLocationState(),
      lang: context.getStore('PreferencesStore').getLanguage(),
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

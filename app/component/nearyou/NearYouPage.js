/* eslint-disable react/no-unstable-nested-components */
import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import { graphql, ReactRelayContext, QueryRenderer } from 'react-relay';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import { relayShape, configShape, locationShape } from '../../util/shapes';
import DesktopView from '../DesktopView';
import MobileView from '../MobileView';
import withBreakpoint, { DesktopOrMobile } from '../../util/withBreakpoint';
import { otpToLocation, locationToUri } from '../../util/otpStrings';
import Loading from '../Loading';
import StopNearYouContainer from './StopNearYouContainer';
import UpdateLocationButton from './UpdateLocationButton';
import MapWrapper from './MapWrapper';
import LocationModal from './LocationModal';
import CityBikeInfo from './CityBikeInfo';
import ParkInfo from './ParkInfo';
import {
  checkPositioningPermission,
  startLocationWatch,
} from '../../action/PositionActions';
import Search from './Search';
import StopRouteSearch from './StopRouteSearch';
import { getGeolocationState } from '../../store/localStorage';
import { PREFIX_NEARYOU } from '../../util/path';
import NearYouContainer from './NearYouContainer';
import SwipeableTabs from '../SwipeableTabs';
import NearYouFavourites from './NearYouFavourites';
import { mapLayerShape } from '../../store/MapLayerStore';
import { getDefaultNetworks } from '../../util/vehicleRentalUtils';
import { getMapLayerOptions } from '../../util/mapLayerUtils';
import {
  getTransportModes,
  getNearYouModes,
  useCitybikes,
} from '../../util/modeUtils';
import FavouriteStore from '../../store/FavouriteStore';

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

function getModes(config) {
  const transportModes = getTransportModes(config);
  const nearYouModes = getNearYouModes(config);
  const modes = nearYouModes.length
    ? nearYouModes
    : Object.keys(transportModes).filter(
        mode => transportModes[mode].availableForSelection,
      );
  return modes.map(nearYouMode => nearYouMode.toUpperCase());
}

function NearYouPage(
  {
    breakpoint,
    relayEnvironment,
    position,
    lang,
    match,
    favouriteStopIds,
    favouriteStationIds,
    favouriteVehicleStationIds,
    mapLayers,
    favouritesFetched,
    currentTime,
  },
  { config, executeAction, router },
) {
  const MWTRef = useRef();
  const modes = useRef(getModes(config));
  const centerOfMap = useRef({});
  const [phase, setPhase] = useState(PH_START);
  const [centerOfMapChanged, setCenterOfMapChanged] = useState(false);
  const [searchPosition, setSearchPosition] = useState({});
  const [mapLayerOptions, setMapLayerOptions] = useState({});
  // eslint-disable-next-line
  const [resultsLoaded, setResultsLoaded] = useState(false);

  const { mode } = match.params;
  const allModes = modes.current;

  const updateMapLayerOptions = () => {
    if (config.map.showLayerSelector) {
      const options = getMapLayerOptions({
        lockedMapLayers: ['vehicles', 'citybike', 'stop'],
        selectedMapLayers: ['vehicles', mode.toLowerCase()],
      });
      setMapLayerOptions(options);
    }
  };

  useEffect(() => {
    updateMapLayerOptions();
    checkPositioningPermission().then(permission => {
      const { origin: matchParamsOrigin, place } = match.params;
      const savedPermission = getGeolocationState();
      const { state } = permission;
      let newSearchPosition = matchParamsOrigin
        ? otpToLocation(matchParamsOrigin)
        : config.defaultEndpoint;
      let newPhase;
      if (savedPermission === 'unknown') {
        if (!matchParamsOrigin) {
          // state = 'error' means no permission api, so we assume geolocation will work
          if (state === 'prompt' || state === 'granted' || state === 'error') {
            newPhase = PH_SEARCH_GEOLOCATION;
          } else {
            newPhase = PH_SEARCH;
          }
        } else {
          newPhase = PH_USEDEFAULTPOS;
        }
      } else if (
        state === 'prompt' ||
        state === 'granted' ||
        (state === 'error' && savedPermission !== 'denied')
      ) {
        // reason to expect that geolocation will work
        newPhase = PH_GEOLOCATIONING;
        executeAction(startLocationWatch);
      } else if (matchParamsOrigin) {
        newPhase = PH_USEDEFAULTPOS;
      } else if (state === 'error') {
        // No permission api.
        // Suggest geolocation, user may have changed permissions from browser settings
        newPhase = PH_SEARCH_GEOLOCATION;
      } else {
        // Geolocationing is known to be denied. Provide search modal
        newPhase = PH_SEARCH;
      }
      if (place !== 'POS') {
        newSearchPosition = otpToLocation(place);
        newPhase = PH_USEDEFAULTPOS;
      }
      setSearchPosition(newSearchPosition);
      setPhase(newPhase);
    });
  }, []);

  useEffect(() => {
    updateMapLayerOptions();
  }, [mode]);

  useEffect(() => {
    if (phase === PH_GEOLOCATIONING) {
      if (position.locationingFailed) {
        setPhase(PH_USEDEFAULTPOS);
      } else if (position.hasLocation) {
        setPhase(PH_USEGEOLOCATION);
        setSearchPosition(position);
      }
    }
  }, [phase, position.locationingFailed, position.hasLocation]);

  const loadingDone = () => {
    // trigger a state update in this component to force a rerender when stop data is received for the first time.
    // this fixes a bug where swipeable tabs were not keeping focusable elements up to date after receving stop data
    // and keyboard focus could be lost to hidden elements.
    // eslint-disable-next-line react/no-unused-state
    setResultsLoaded(true);
  };

  const getQueryVariables = queryMode => {
    if (queryMode === 'FAVORITE') {
      return {
        stopIds: favouriteStopIds,
        stationIds: favouriteStationIds,
        vehicleRentalStationIds: favouriteVehicleStationIds,
      };
    }
    let placeTypes = [];
    let qModes = [];
    let allowedNetworks = [];
    switch (queryMode) {
      case 'CITYBIKE':
        placeTypes = 'VEHICLE_RENT';
        qModes = ['BICYCLE'];
        allowedNetworks = getDefaultNetworks(config);
        break;
      case 'BIKEPARK':
        placeTypes = 'BIKE_PARK';
        break;
      case 'CARPARK':
        placeTypes = 'CAR_PARK';
        break;
      default:
        placeTypes = ['STOP', 'STATION'];
        qModes = [queryMode];
        break;
    }
    const prioritizedStops =
      config.prioritizedStopsNearYou[queryMode.toLowerCase()] || [];
    return {
      lat: searchPosition.lat,
      lon: searchPosition.lon,
      maxResults: 10,
      first: config.maxNearYouCount,
      maxDistance: config.maxNearYouDistance[queryMode.toLowerCase()],
      filterByModes: qModes,
      filterByPlaceTypes: placeTypes,
      omitNonPickups: config.omitNonPickups,
      prioritizedStopIds: prioritizedStops,
      filterByNetwork: allowedNetworks,
    };
  };

  const setCenterOfMap = mapElement => {
    let location;
    if (!mapElement) {
      location = position;
    } else if (breakpoint === 'large') {
      const center = mapElement.leafletElement.getCenter();
      location = { lat: center.lat, lon: center.lng };
    } else {
      // find center pixel coordinates of the visible part of the map
      // and convert to lat, lon
      const opts = mapElement.leafletElement.options;
      const bo = opts.boundsOptions;
      const size = mapElement.leafletElement.getSize();
      const x =
        bo.paddingTopLeft[0] +
        (size.x - bo.paddingTopLeft[0] - bo.paddingBottomRight[0]) / 2;
      const y =
        bo.paddingTopLeft[1] +
        (size.y - bo.paddingTopLeft[1] - bo.paddingBottomRight[1]) / 2;
      const point = mapElement.leafletElement.containerPointToLatLng([x, y]);
      location = { lat: point.lat, lon: point.lng };
    }
    centerOfMap.current = location;
    const changed = distance(location, searchPosition) > 200;
    if (changed !== centerOfMapChanged) {
      setCenterOfMapChanged(changed);
    }
  };

  // store ref to map
  const setMWTRef = ref => {
    MWTRef.current = ref;
  };

  const updateLocation = () => {
    const center = centerOfMap.current;
    if (center?.lat && center?.lon) {
      let newPhase = PH_USEMAPCENTER;
      let type = 'CenterOfMap';
      if (center.type === 'CurrentLocation') {
        newPhase = PH_USEGEOLOCATION;
        type = center.type;
        const path = `/${PREFIX_NEARYOU}/${mode}/POS`;
        router.replace({
          ...match.location,
          pathname: path,
        });
      } else {
        const path = `/${PREFIX_NEARYOU}/${mode}/${locationToUri(center)}`;
        router.replace({
          ...match.location,
          pathname: path,
        });
      }
      setSearchPosition({ ...center, type });
      setCenterOfMapChanged(false);
      setPhase(newPhase);
    } else {
      setSearchPosition(phase === PH_USEDEFAULTPOS ? searchPosition : position);
    }
  };

  const onSwipe = e => {
    const newMode = allModes[e];
    const paramArray = match.location.pathname.split(mode);
    const pathParams = paramArray.length > 1 ? paramArray[1] : '/POS';
    const path = `/${PREFIX_NEARYOU}/${newMode}${pathParams}`;
    router.replace({
      ...match.location,
      pathname: path,
    });
    setCenterOfMapChanged(false);
  };

  const noFavourites = () =>
    !favouriteStopIds.length &&
    !favouriteStationIds.length &&
    !favouriteVehicleStationIds.length;

  const renderContent = () => {
    const index = allModes.indexOf(mode);
    const tabs = allModes.map(tabMode => {
      const renderStopRouteSearch =
        tabMode !== 'FERRY' && tabMode !== 'FAVORITE';
      const isActive = tabMode === mode;
      if (tabMode === 'FAVORITE') {
        const noFavs = noFavourites();
        return (
          <div
            key={tabMode}
            className={`near-you-page swipeable-tab ${!isActive && 'inactive'}`}
            aria-hidden={!isActive}
          >
            {centerOfMapChanged && !noFavs && (
              <UpdateLocationButton mode={tabMode} onClick={updateLocation} />
            )}
            {favouritesFetched ? (
              <NearYouFavourites
                stopIds={favouriteStopIds}
                stationIds={favouriteStationIds}
                vehicleRentalStationIds={favouriteVehicleStationIds}
                searchPosition={searchPosition}
                noFavourites={noFavs}
                isParentTabActive={isActive}
                currentTime={currentTime}
              />
            ) : (
              <Loading />
            )}
          </div>
        );
      }

      return (
        <div
          className={`swipeable-tab ${!isActive && 'inactive'}`}
          key={tabMode}
          aria-hidden={!isActive}
        >
          <QueryRenderer
            query={graphql`
              query NearYouPageContentQuery(
                $lat: Float!
                $lon: Float!
                $filterByPlaceTypes: [FilterPlaceType]
                $filterByModes: [Mode]
                $first: Int!
                $maxResults: Int!
                $maxDistance: Int!
                $omitNonPickups: Boolean!
                $filterByNetwork: [String!]
              ) {
                places: viewer {
                  ...NearYouContainer_places
                    @arguments(
                      lat: $lat
                      lon: $lon
                      filterByPlaceTypes: $filterByPlaceTypes
                      filterByModes: $filterByModes
                      first: $first
                      maxResults: $maxResults
                      maxDistance: $maxDistance
                      omitNonPickups: $omitNonPickups
                      filterByNetwork: $filterByNetwork
                    )
                }
              }
            `}
            variables={getQueryVariables(tabMode)}
            environment={relayEnvironment}
            render={({ props }) => {
              const prioritizedStops =
                config.prioritizedStopsNearYou[tabMode.toLowerCase()] || [];
              let favIds;
              switch (mode) {
                case 'CITYBIKE':
                  favIds = new Set(favouriteVehicleStationIds);
                  break;
                case 'BIKEPARK':
                case 'CARPARK':
                  favIds = new Set();
                  break;
                default:
                  favIds = new Set([
                    ...favouriteStopIds,
                    ...favouriteStationIds,
                  ]);
                  break;
              }
              return (
                <div className="near-you-page">
                  {renderStopRouteSearch && (
                    <StopRouteSearch
                      mode={tabMode}
                      isMobile={breakpoint !== 'large'}
                      lang={lang}
                      refPoint={searchPosition}
                    />
                  )}
                  {tabMode === 'CITYBIKE' && <CityBikeInfo lang={lang} />}
                  {(tabMode === 'CARPARK' || tabMode === 'BIKEPARK') && (
                    <ParkInfo mode={tabMode} />
                  )}
                  {centerOfMapChanged && (
                    <UpdateLocationButton
                      mode={tabMode}
                      onClick={updateLocation}
                    />
                  )}
                  {prioritizedStops.length ? (
                    <QueryRenderer
                      query={graphql`
                        query NearYouPagePrioritizedStopsQuery(
                          $stopIds: [String!]!
                          $startTime: Long!
                          $omitNonPickups: Boolean!
                        ) {
                          stops: stops(ids: $stopIds) {
                            gtfsId
                            ...StopNearYouContainer_stop
                              @arguments(
                                startTime: $startTime
                                omitNonPickups: $omitNonPickups
                              )
                          }
                        }
                      `}
                      variables={{
                        stopIds: prioritizedStops,
                        startTime: 0,
                        omitNonPickups: false,
                      }}
                      environment={relayEnvironment}
                      render={res =>
                        res.props?.stops.map(stop => (
                          <StopNearYouContainer
                            stop={stop}
                            key={stop.gtfsId}
                            currentTime={currentTime}
                            isParentTabActive={isActive}
                          />
                        ))
                      }
                    />
                  ) : null}

                  {props ? (
                    <NearYouContainer
                      // eslint-disable-next-line
                      places={props.places}
                      prioritizedStops={prioritizedStops}
                      loadingDone={loadingDone}
                      position={searchPosition}
                      withSeparator={!renderStopRouteSearch}
                      mode={tabMode}
                      isParentTabActive={isActive}
                      currentTime={currentTime}
                      favouriteIds={favIds}
                    />
                  ) : (
                    <div className="near-you-spinner-container">
                      <Loading />
                    </div>
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
          onSwipe={onSwipe}
          tabs={tabs}
          classname={breakpoint === 'large' ? 'swipe-desktop-view' : ''}
          ariaRole="swipe-stops-near-you-tab"
        />
      );
    }
    return tabs[0];
  };

  const renderMap = () => (
    <MapWrapper
      favouriteStopIds={favouriteStopIds}
      favouriteStationIds={favouriteStationIds}
      favouriteVehicleStationIds={favouriteVehicleStationIds}
      relayEnvironment={relayEnvironment}
      position={searchPosition}
      match={match}
      setCenterOfMap={setCenterOfMap}
      showWalkRoute={phase === PH_USEGEOLOCATION || phase === PH_USEDEFAULTPOS}
      mapLayers={mapLayers}
      mapLayerOptions={mapLayerOptions}
      breakpoint={breakpoint}
      setMWTRef={setMWTRef}
      variables={getQueryVariables(mode)}
    />
  );

  const handleClose = () => setPhase(PH_USEDEFAULTPOS);

  const handleStartGeolocation = () => {
    executeAction(startLocationWatch);
    setPhase(PH_GEOLOCATIONING);
  };

  const selectHandler = item => {
    const path = `/${PREFIX_NEARYOU}/${mode}/${locationToUri(item)}`;
    router.replace({
      ...match.location,
      pathname: path,
    });
    centerOfMap.current = {};
    setPhase(PH_USEDEFAULTPOS);
    setSearchPosition(item);
    setCenterOfMapChanged(false);
  };

  const search = onMap => (
    <Search
      onMap={onMap}
      lang={lang}
      selectHandler={selectHandler}
      isMobile={breakpoint !== 'large'}
      refPoint={searchPosition}
    />
  );

  const mapSearch = () => {
    return <div className="near-you-location-search">{search(true)}</div>;
  };

  if (PH_SHOWSEARCH.includes(phase)) {
    return (
      <LocationModal
        handleClose={handleClose}
        startGeolocation={handleStartGeolocation}
        showGeolocationButton={phase === PH_SEARCH_GEOLOCATION}
        showInfo={phase === PH_SEARCH}
      >
        {search(false)}
      </LocationModal>
    );
  }
  if (PH_READY.includes(phase)) {
    return (
      <DesktopOrMobile
        desktop={() => (
          <DesktopView
            title={
              mode === 'FAVORITE' ? (
                <FormattedMessage id="nearest-favourites" />
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
            content={renderContent()}
            scrollable={allModes.length === 1}
            map={
              <>
                {mapSearch()}
                {renderMap()}
              </>
            }
          />
        )}
        mobile={() => (
          <MobileView
            content={renderContent()}
            map={renderMap()}
            searchBox={mapSearch()}
            mapRef={MWTRef.current}
            match={match}
          />
        )}
      />
    );
  }
  return <Loading />;
}

NearYouPage.contextTypes = {
  config: configShape.isRequired,
  executeAction: PropTypes.func.isRequired,
  getStore: PropTypes.func,
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
};

NearYouPage.propTypes = {
  breakpoint: PropTypes.string.isRequired,
  relayEnvironment: relayShape.isRequired,
  position: locationShape.isRequired,
  lang: PropTypes.string.isRequired,
  match: matchShape.isRequired,
  favouriteStopIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  favouriteStationIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  favouriteVehicleStationIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  mapLayers: mapLayerShape.isRequired,
  favouritesFetched: PropTypes.bool,
  currentTime: PropTypes.number.isRequired,
};

NearYouPage.defaultProps = {
  favouritesFetched: false,
};

const NearYouPageWithBreakpoint = withBreakpoint(props => (
  <ReactRelayContext.Consumer>
    {({ environment }) => (
      <NearYouPage {...props} relayEnvironment={environment} />
    )}
  </ReactRelayContext.Consumer>
));

const PositioningWrapper = connectToStores(
  NearYouPageWithBreakpoint,
  [
    'PositionStore',
    'PreferencesStore',
    'FavouriteStore',
    'MapLayerStore',
    'TimeStore',
  ],
  (context, props) => {
    const favStore = context.getStore('FavouriteStore');
    const favouriteStopIds = favStore
      .getStopsAndStations()
      .filter(stop => stop.type === 'stop')
      .map(stop => stop.gtfsId);
    const favouriteStationIds = favStore
      .getStopsAndStations()
      .filter(stop => stop.type === 'station')
      .map(stop => stop.gtfsId);
    const favouriteVehicleStationIds = useCitybikes(
      context.config.vehicleRental?.networks,
      context.config,
    )
      ? favStore.getVehicleRentalStations().map(station => station.stationId)
      : [];

    return {
      ...props,
      currentTime: context.getStore('TimeStore').getCurrentTime(),
      position: context.getStore('PositionStore').getLocationState(),
      lang: context.getStore('PreferencesStore').getLanguage(),
      mapLayers: context
        .getStore('MapLayerStore')
        .getMapLayers({ notThese: ['vehicles', 'scooter'] }),
      favouriteStopIds,
      favouriteVehicleStationIds,
      favouriteStationIds,
      favouritesFetched:
        favStore.getStatus() !== FavouriteStore.STATUS_FETCHING_OR_UPDATING,
    };
  },
);

PositioningWrapper.contextTypes = {
  getStore: PropTypes.func.isRequired,
  config: configShape.isRequired,
};

export {
  PositioningWrapper as default,
  NearYouPageWithBreakpoint as Component,
};

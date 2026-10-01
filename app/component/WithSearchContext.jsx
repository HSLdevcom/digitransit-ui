import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import getJson from '@digitransit-search-util/digitransit-search-util-get-json';
import suggestionToLocation from '@digitransit-search-util/digitransit-search-util-suggestion-to-location';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { useIntl } from 'react-intl';
import { locationStateShape } from '../../utils/client/shapes';
import { addAnalyticsEvent } from '../../utils/shared/analyticsUtils';
import { useCitybikes } from '../../utils/client/modeUtils';
import {
  PREFIX_ITINERARY_SUMMARY,
  PREFIX_STOPS,
  PREFIX_ROUTES,
} from '../../utils/shared/path';
import searchContext from '../data/SearchContext';
import { useConfigContext } from '../client/ConfigContext';
import SelectFromMapHeader from './SelectFromMapHeader';
import SelectFromMap from './map/SelectFromMap';
import DTModal from './DTModal';
import FromMapModal from './FromMapModal';
import { removeSearch } from '../action/SearchActions';

const PATH_OPTS = {
  stopsPrefix: PREFIX_STOPS,
  routesPrefix: PREFIX_ROUTES,
  itinerarySummaryPrefix: PREFIX_ITINERARY_SUMMARY,
};

export function getLocationSearchTargets(config, isMobile) {
  let locationSearchTargets = ['Locations', 'CurrentPosition'];

  if (config.locationSearchTargetsFromOTP) {
    // configurable setup
    locationSearchTargets = [
      ...locationSearchTargets,
      ...config.locationSearchTargetsFromOTP,
    ];
  } else {
    // default setup
    locationSearchTargets.push('Stations');
    locationSearchTargets.push('Stops');
    if (useCitybikes(config.vehicleRental?.networks, config)) {
      locationSearchTargets.push('VehicleRentalStations');
    }
    if (config.includeParkAndRideSuggestions) {
      locationSearchTargets.push('ParkingAreas');
    }
  }
  if (isMobile) {
    locationSearchTargets.push('MapPosition');
  }
  return locationSearchTargets;
}

export function withSearchContext(WrappedComponent, embeddedSearch = false) {
  function ComponentWithSearchContext(
    {
      selectHandler,
      locationState,
      onGeolocationStart = null,
      fromMap: initialFromMap,
      isMobile = false,
      favouriteContext = false,
      showViapointControl = false,
      ...rest
    },
    { executeAction },
  ) {
    const intl = useIntl();
    const config = useConfigContext();
    const [fromMap, setFromMap] = useState(initialFromMap);
    // { id } of the search field waiting for geolocation, or null. An object
    // because id can be a via point index 0.
    const pendingLocationRef = useRef(null);

    const saveOldSearch = (item, type, id) => {
      if (
        item.type !== 'FutureRoute' &&
        item.type !== 'CurrentLocation' &&
        item.type !== 'SelectFromMap' &&
        item.type.indexOf('Favourite') === -1 &&
        id !== 'favourite' &&
        (!item.properties ||
          !item.properties.layer ||
          item.properties.layer.indexOf('favourite') === -1)
      ) {
        executeAction(searchContext.saveSearch, {
          item,
          type,
        });
      }
    };

    const onSuggestionSelected = (item, id) => {
      if (item.type === 'SelectFromMap') {
        setFromMap(id);
      } else if (id !== 'stop-route-station' && item.type !== 'FutureRoute') {
        let location;
        if (item.type === 'CurrentLocation') {
          if (embeddedSearch) {
            selectHandler(
              {
                type: 'CurrentLocation',
                status: 'no-location',
                address: intl.formatMessage({
                  id: 'own-position',
                  defaultMessage: 'Own Location',
                }),
              },
              id,
            );
            return;
          }
          // item is already a location.
          location = item;
          if (
            item.properties &&
            item.properties.layer === 'currentPosition' &&
            !item.properties.lat
          ) {
            pendingLocationRef.current = { id };
            executeAction(searchContext.startLocationWatch);
            if (onGeolocationStart) {
              onGeolocationStart(item, id);
            }
            return;
          }
          if (!location.address) {
            location.address = intl.formatMessage({
              id: 'own-position',
              defaultMessage: 'Own Location',
            });
          }
        } else {
          location = suggestionToLocation(item);
        }
        selectHandler(location, id);
      } else {
        selectHandler(item, id);
      }
    };

    // Finish a current location selection once positioning resolves. Only
    // locationState changes should trigger this, so onSuggestionSelected is
    // deliberately left out of the dependencies.
    useEffect(() => {
      const pending = pendingLocationRef.current;
      if (!pending) {
        return;
      }
      if (locationState.status === 'found-address') {
        pendingLocationRef.current = null;
        onSuggestionSelected(locationState, pending.id);
      } else if (locationState.locationingFailed) {
        pendingLocationRef.current = null;
      }
    }, [locationState]);

    // top level onSelect callback manages search history
    const onSelect = (item, id) => {
      // type for storing old searches. 'endpoint' types are available in itinerary search
      let type = 'endpoint';
      switch (item.type) {
        case 'Route':
          type = 'search'; // can't be used as location
          break;
        case 'OldSearch':
          if (item.properties?.layer?.startsWith('route-')) {
            type = 'search';
          }
          break;
        default:
      }
      if (
        item.type === 'OldSearch' &&
        item.properties.layer?.startsWith('route-') &&
        item.properties.gtfsId
      ) {
        searchContext
          .getRoutesByIds([item.properties.gtfsId], PATH_OPTS)
          .then(routes => {
            if (routes.length > 0) {
              const refreshed = { ...item, ...routes[0], type: item.type };
              saveOldSearch(refreshed, type, id);
              onSuggestionSelected(refreshed, id);
            } else {
              // route no longer exists; drop the stale saved search entirely
              executeAction(removeSearch, { item, type });
              onSuggestionSelected(item, id);
            }
          })
          .catch(() => {
            saveOldSearch(item, type, id);
            onSuggestionSelected(item, id);
          });
      } else if (item.type === 'OldSearch' && item.properties.gid) {
        getJson(config.URL.PELIAS_PLACE, {
          ids: item.properties.gid,
        })
          .then(res => {
            const newItem = { ...item };
            let canSave = true;
            if (res.features != null && res.features.length > 0) {
              // update only position. It is surprising if, say, the name changes at selection.
              const geom = res.features[0].geometry;
              newItem.geometry.coordinates = geom.coordinates;
              if (
                newItem.properties.name !== res.features[0].properties.name ||
                newItem.properties.street !==
                  res.features[0].properties.street ||
                newItem.properties.housenumber !==
                  res.features[0].properties.housenumber
              ) {
                // Item properties have changed unexpectedly. For example,
                // an enterprise may have moved to new premises. Remove outdated information.
                canSave = false;
              }
            }
            if (canSave) {
              saveOldSearch(newItem, type, id);
            } else {
              executeAction(removeSearch, {
                item: newItem,
                type,
              });
            }
            onSuggestionSelected(item, id);
          })
          .catch(() => {
            saveOldSearch(item, type, id);
            onSuggestionSelected(item, id);
          });
      } else {
        saveOldSearch(item, type, id);
        onSuggestionSelected(item, id);
      }
    };

    const confirmMapSelection = (type, mapLocation) => {
      setFromMap(undefined);
      selectHandler(mapLocation, type);
    };

    if (fromMap !== undefined) {
      let titleId = '';

      if (fromMap === 'origin') {
        titleId = 'select-from-map-origin';
      } else if (fromMap === 'destination') {
        titleId = 'select-from-map-destination';
      } else if (fromMap === 'favourite') {
        titleId = 'select-from-map-favourite';
      } else if (fromMap === parseInt(fromMap, 10)) {
        // id = via point index
        titleId = 'select-from-map-viaPoint';
      }

      if (!isMobile) {
        return (
          <FromMapModal
            onClose={() => setFromMap(undefined)}
            titleId={titleId}
            favouriteContext={favouriteContext}
          >
            <SelectFromMap type={fromMap} onConfirm={confirmMapSelection} />
          </FromMapModal>
        );
      }

      return (
        <DTModal show>
          <SelectFromMapHeader
            titleId={titleId}
            onBackBtnClick={() => setFromMap(undefined)}
            hideCloseBtn
          />
          <SelectFromMap type={fromMap} onConfirm={confirmMapSelection} />
        </DTModal>
      );
    }

    const viaProps = showViapointControl
      ? { handleViaPointLocationSelected: onSelect }
      : {};
    return (
      <WrappedComponent
        appElement="#app"
        searchContext={searchContext}
        addAnalyticsEvent={addAnalyticsEvent}
        onSelect={onSelect}
        selectHandler={selectHandler}
        locationState={locationState}
        onGeolocationStart={onGeolocationStart}
        fromMap={initialFromMap}
        isMobile={isMobile}
        favouriteContext={favouriteContext}
        showViapointControl={showViapointControl}
        {...rest}
        {...viaProps}
        pathOpts={PATH_OPTS}
      />
    );
  }

  ComponentWithSearchContext.contextTypes = {
    executeAction: PropTypes.func.isRequired,
  };

  ComponentWithSearchContext.propTypes = {
    selectHandler: PropTypes.func.isRequired,
    locationState: locationStateShape.isRequired,
    onGeolocationStart: PropTypes.func,
    fromMap: PropTypes.string,
    isMobile: PropTypes.bool,
    favouriteContext: PropTypes.bool,
    showViapointControl: PropTypes.bool,
  };

  const componentWithPosition = connectToStores(
    ComponentWithSearchContext,
    ['PositionStore'],
    context => ({
      locationState: context.getStore('PositionStore').getLocationState(),
    }),
  );
  return componentWithPosition;
}

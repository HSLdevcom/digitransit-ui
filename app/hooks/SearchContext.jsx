import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import getJson from '@digitransit-search-util/digitransit-search-util-get-json';
import suggestionToLocation from '@digitransit-search-util/digitransit-search-util-suggestion-to-location';
import { useIntl } from 'react-intl';
import { SEARCH_PATH_OPTS } from '../../utils/client/searchUtils';
import searchContext from '../data/SearchContext';
import { removeSearch, saveSearch } from '../data/SearchHistory';
import { useConfigContext } from './ConfigContext';
import { usePosition, usePositionActions } from './PositionContext';

const SearchContext = createContext(null);

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}

function saveOldSearch(item, type, id) {
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
    saveSearch({ item, type });
  }
}

export function SearchProvider({
  children = null,
  selectHandler,
  onGeolocationStart = null,
  embeddedSearch = false,
  fromMap: initialFromMap,
  onFromMapClose = null,
}) {
  const intl = useIntl();
  const config = useConfigContext();
  const locationState = usePosition();
  const { startLocationWatch } = usePositionActions();
  const [fromMap, setFromMap] = useState(initialFromMap);
  // An object keeps via-point ID 0 distinct from no pending selection.
  const pendingLocationRef = useRef(null);

  useEffect(() => {
    return () => {
      pendingLocationRef.current = null;
    };
  }, []);

  const onSuggestionSelected = useCallback(
    (item, id) => {
      // A late position result must not overwrite a manual selection.
      if (pendingLocationRef.current && pendingLocationRef.current.id === id) {
        pendingLocationRef.current = null;
      }
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
          location = item;
          if (
            item.properties &&
            item.properties.layer === 'currentPosition' &&
            !item.properties.lat
          ) {
            pendingLocationRef.current = { id };
            startLocationWatch();
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
    },
    [
      embeddedSearch,
      intl,
      onGeolocationStart,
      selectHandler,
      startLocationWatch,
    ],
  );

  // Only position updates complete a pending selection, not callback changes.
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

  const onSelect = useCallback(
    (item, id) => {
      let type = 'endpoint';
      switch (item.type) {
        case 'Route':
          type = 'search';
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
          .getRoutesByIds([item.properties.gtfsId], SEARCH_PATH_OPTS)
          .then(routes => {
            if (routes.length > 0) {
              const refreshed = { ...item, ...routes[0], type: item.type };
              saveOldSearch(refreshed, type, id);
              onSuggestionSelected(refreshed, id);
            } else {
              // Drop saved routes that no longer exist.
              removeSearch({ item, type });
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
              // Refresh coordinates without changing the displayed name.
              const geom = res.features[0].geometry;
              newItem.geometry.coordinates = geom.coordinates;
              if (
                newItem.properties.name !== res.features[0].properties.name ||
                newItem.properties.street !==
                  res.features[0].properties.street ||
                newItem.properties.housenumber !==
                  res.features[0].properties.housenumber
              ) {
                // Remove entries whose address details have changed.
                canSave = false;
              }
            }
            if (canSave) {
              saveOldSearch(newItem, type, id);
            } else {
              removeSearch({
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
    },
    [onSuggestionSelected],
  );

  const confirmMapSelection = useCallback(
    (type, mapLocation) => {
      setFromMap(undefined);
      selectHandler(mapLocation, type);
    },
    [selectHandler],
  );

  const closeMapSelection = useCallback(() => {
    setFromMap(undefined);
    if (onFromMapClose) {
      onFromMapClose();
    }
  }, [onFromMapClose]);

  const value = useMemo(
    () => ({
      searchContext,
      onSelect,
      selectHandler,
      onGeolocationStart,
      locationState,
      fromMap,
      closeMapSelection,
      confirmMapSelection,
    }),
    [
      onSelect,
      selectHandler,
      onGeolocationStart,
      locationState,
      fromMap,
      closeMapSelection,
      confirmMapSelection,
    ],
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

SearchProvider.propTypes = {
  children: PropTypes.node,
  selectHandler: PropTypes.func.isRequired,
  onGeolocationStart: PropTypes.func,
  embeddedSearch: PropTypes.bool,
  fromMap: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onFromMapClose: PropTypes.func,
};

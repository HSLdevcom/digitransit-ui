import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import favouriteStore from '../store/FavouriteStore';
import { addMessage } from '../action/MessageActions';
import { failedFavouriteMessage, favouriteTypes } from '../util/messageUtils';
import { useConfigContext } from '../configurations/ConfigContext';

const fluxibleContextShape = PropTypes.shape({
  executeAction: PropTypes.func.isRequired,
});

const FavouriteContext = createContext({
  favourites: [],
  favouriteStatus: null,
  actions: {
    saveFavourite: () => {},
    updateFavourites: () => {},
    deleteFavourite: () => {},
    fetchFavourites: () => {},
    clearFavourites: () => {},
  },
});

export const useFavourites = () => useContext(FavouriteContext).favourites;

export const useFavouriteStatus = () =>
  useContext(FavouriteContext).favouriteStatus;

export const useFavouriteActions = () => useContext(FavouriteContext).actions;

function resolveFavouriteType(data) {
  const item = Array.isArray(data) ? data[0] : data;
  return typeof item === 'object' && favouriteTypes.includes(item?.type)
    ? item.type
    : favouriteTypes[0];
}

export function FavouriteProvider({ context, children }) {
  const config = useConfigContext();
  const [favourites, setFavourites] = useState(favouriteStore.getFavourites());
  const [favouriteStatus, setFavouriteStatus] = useState(
    favouriteStore.getStatus(),
  );

  useEffect(() => {
    favouriteStore.init(config);
    const onChange = () => {
      setFavourites(favouriteStore.getFavourites());
      setFavouriteStatus(favouriteStore.getStatus());
    };
    onChange();
    favouriteStore.addChangeListener(onChange);
    return () => favouriteStore.removeChangeListener(onChange);
  }, [config]);

  // Sends a failure message via the (still Fluxible-backed) MessageStore.
  // This if statement should be removed when backend service is added for waltti
  const notifyFailure = useCallback(
    (type, isSave) => {
      if (!config.allowFavouritesFromLocalstorage) {
        context.executeAction(addMessage, failedFavouriteMessage(type, isSave));
      }
    },
    [config, context],
  );

  const actions = useMemo(
    () => ({
      saveFavourite: data =>
        favouriteStore.saveFavourite(data, () =>
          notifyFailure(resolveFavouriteType(data), true),
        ),
      updateFavourites: newFavourites =>
        favouriteStore.updateFavourites(newFavourites, () =>
          notifyFailure(resolveFavouriteType(newFavourites), true),
        ),
      deleteFavourite: data =>
        favouriteStore.deleteFavourite(data, () =>
          notifyFailure(resolveFavouriteType(data), false),
        ),
      fetchFavourites: () => favouriteStore.fetchFavourites(),
      fetchFavouritesComplete: () => favouriteStore.fetchComplete(),
      clearFavourites: () => favouriteStore.clearFavourites(),
    }),
    [notifyFailure],
  );

  const value = useMemo(
    () => ({ favourites, favouriteStatus, actions }),
    [favourites, favouriteStatus, actions],
  );

  return (
    <FavouriteContext.Provider value={value}>
      {children}
    </FavouriteContext.Provider>
  );
}

FavouriteProvider.propTypes = {
  context: fluxibleContextShape.isRequired,
  children: PropTypes.node,
};

FavouriteProvider.defaultProps = {
  children: null,
};

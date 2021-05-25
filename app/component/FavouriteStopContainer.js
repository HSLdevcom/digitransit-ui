import PropTypes from 'prop-types';
import React, { useState } from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import getJson from '@digitransit-search-util/digitransit-search-util-get-json';
import Favourite from './Favourite';
import { saveFavourite, deleteFavourite } from '../action/FavouriteActions';
import { addMessage } from '../action/MessageActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { failedFavouriteMessage } from '../util/messageUtils';

function FavouriteStopContainerComponent(props, context) {
  const [isFetching, setIsFetching] = useState(false);
  const { stop, isTerminal } = props;
  return (
    <Favourite
      {...props}
      isFetching={props.isFetching || isFetching}
      addFavourite={() => {
        setIsFetching(true);
        const favouriteType = isTerminal ? 'station' : 'stop';
        let gid = `gtfs${stop.gtfsId
          .split(':')[0]
          .toLowerCase()}:${favouriteType}:GTFS:${stop.gtfsId}`;
        if (stop.code) {
          gid += `#${stop.code}`;
        }

        getJson(context.config.URL.PELIAS_PLACE, {
          ids: gid,
          // lang: context.getStore('PreferencesStore').getLanguage(), TODO enable this when OTP supports translations
        })
          .then(res => {
            if (Array.isArray(res.features) && res.features.length > 0) {
              const stopOrStation = res.features[0];
              const { label } = stopOrStation.properties;
              context.executeAction(saveFavourite, {
                address: label,
                code: stop.code,
                gid,
                gtfsId: stop.gtfsId,
                lat: stop.lat,
                lon: stop.lon,
                type: favouriteType,
              });
              addAnalyticsEvent({
                category: 'Stop',
                action: 'MarkStopAsFavourite',
                name: !context
                  .getStore('FavouriteStore')
                  .isFavourite(stop.gtfsId, favouriteType),
              });
              setIsFetching(false);
            } else {
              context.executeAction(
                addMessage,
                failedFavouriteMessage(favouriteType, true),
              );
              setIsFetching(false);
            }
          })
          .catch(() => {
            context.executeAction(
              addMessage,
              failedFavouriteMessage(favouriteType, true),
            );
            setIsFetching(false);
          });
      }}
    />
  );
}

FavouriteStopContainerComponent.propTypes = {
  stop: PropTypes.object,
  isTerminal: PropTypes.bool,
  isFetching: PropTypes.bool,
};

const FavouriteStopContainer = connectToStores(
  FavouriteStopContainerComponent,
  ['FavouriteStore', 'UserStore', 'PreferencesStore'],
  (context, { stop, isTerminal }) => ({
    favourite: context
      .getStore('FavouriteStore')
      .isFavourite(stop.gtfsId, isTerminal ? 'station' : 'stop'),
    isFetching: context.getStore('FavouriteStore').getStatus() === 'fetching',
    deleteFavourite: () => {
      const stopToDelete = context
        .getStore('FavouriteStore')
        .getByGtfsId(stop.gtfsId, isTerminal ? 'station' : 'stop');
      context.executeAction(deleteFavourite, stopToDelete);
      addAnalyticsEvent({
        category: 'Stop',
        action: 'MarkStopAsFavourite',
        name: !context
          .getStore('FavouriteStore')
          .isFavourite(stop.gtfsId, isTerminal ? 'station' : 'stop'),
      });
    },
    requireLoggedIn: !context.config.allowFavouritesFromLocalstorage,
    isLoggedIn:
      context.config.allowLogin &&
      context.getStore('UserStore').getUser().sub !== undefined,
    language: context.getStore('PreferencesStore').getLanguage(),
  }),
);

FavouriteStopContainer.contextTypes = {
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};

FavouriteStopContainerComponent.contextTypes = {
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};
export default FavouriteStopContainer;

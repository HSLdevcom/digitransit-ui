import PropTypes from 'prop-types';
import React, { useState } from 'react';
import getJson from '@digitransit-search-util/digitransit-search-util-get-json';
import { stopShape } from '../util/shapes';
import Favourite from './Favourite';
import {
  isFavourite as isFavouriteFn,
  getFavouriteByGtfsId,
} from '../store/FavouriteStore';
import {
  useFavourites,
  useFavouriteStatus,
  useFavouriteActions,
} from '../hooks/FavouriteContext';
import { addMessage } from '../action/MessageActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { failedFavouriteMessage } from '../util/messageUtils';
import { useConfigContext } from '../configurations/ConfigContext';

function FavouriteStopContainerComponent(props, context) {
  const [isFetching, setIsFetching] = useState(false);
  const { stop, isTerminal } = props;
  const config = useConfigContext();
  const favourites = useFavourites();
  const favouriteStatus = useFavouriteStatus();
  const { saveFavourite, deleteFavourite } = useFavouriteActions();

  const favouriteType = isTerminal ? 'station' : 'stop';
  const favourite = isFavouriteFn(favourites, stop.gtfsId, favouriteType);

  return (
    <Favourite
      {...props}
      favourite={favourite}
      isFetching={
        props.isFetching || isFetching || favouriteStatus === 'fetching'
      }
      addFavourite={() => {
        setIsFetching(true);
        let gid = `gtfs${stop.gtfsId
          .split(':')[0]
          .toLowerCase()}:${favouriteType}:GTFS:${stop.gtfsId}`;
        if (stop.code) {
          gid += `#${stop.code}`;
        }

        getJson(config.URL.PELIAS_PLACE, { ids: gid })
          .then(res => {
            if (Array.isArray(res.features) && res.features.length > 0) {
              const stopOrStation = res.features[0];
              const { label } = stopOrStation.properties;
              saveFavourite({
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
                name: !favourite,
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
      delFavourite={() => {
        const stopToDelete = getFavouriteByGtfsId(
          favourites,
          stop.gtfsId,
          favouriteType,
        );
        deleteFavourite(stopToDelete);
        addAnalyticsEvent({
          category: 'Stop',
          action: 'MarkStopAsFavourite',
          name: !favourite,
        });
      }}
    />
  );
}

FavouriteStopContainerComponent.propTypes = {
  stop: stopShape.isRequired,
  isTerminal: PropTypes.bool,
  isFetching: PropTypes.bool,
};

FavouriteStopContainerComponent.defaultProps = {
  isTerminal: false,
  isFetching: false,
};

FavouriteStopContainerComponent.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

export default FavouriteStopContainerComponent;

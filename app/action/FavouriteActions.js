import { addMessage } from './MessageActions';
import { failedFavouriteMessage, favouriteTypes } from '../util/messageUtils';

export function saveFavourite(actionContext, data) {
  const favouriteType =
    typeof data === 'object' && favouriteTypes.includes(data.type)
      ? data.type
      : favouriteTypes[0];
  actionContext.dispatch('SaveFavourite', {
    ...data,
    onFail: () => {
      // This if statement should be removed when backend service is added for waltti
      if (!actionContext.config.allowFavouritesFromLocalstorage) {
        actionContext.executeAction(
          addMessage,
          failedFavouriteMessage(favouriteType, true),
        );
      }
    },
  });
}

export function updateFavourites(actionContext, data) {
  const favouriteType =
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0] === 'object' &&
    favouriteTypes.includes(data[0].type)
      ? data[0].type
      : favouriteTypes[0];
  actionContext.dispatch('UpdateFavourites', {
    newFavourites: data,
    onFail: () => {
      // This if statement should be removed when backend service is added for waltti
      if (!actionContext.config.allowFavouritesFromLocalstorage) {
        actionContext.executeAction(
          addMessage,
          failedFavouriteMessage(favouriteType, true),
        );
      }
    },
  });
}

export function deleteFavourite(actionContext, data) {
  const favouriteType =
    typeof data === 'object' && favouriteTypes.includes(data.type)
      ? data.type
      : favouriteTypes[0];
  actionContext.dispatch('DeleteFavourite', {
    ...data,
    onFail: () => {
      // This if statement should be removed when backend service is added for waltti
      if (!actionContext.config.allowFavouritesFromLocalstorage) {
        actionContext.executeAction(
          addMessage,
          failedFavouriteMessage(favouriteType, false),
        );
      }
    },
  });
}

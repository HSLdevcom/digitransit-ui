import { addMessage } from './MessageActions';
import failedFavouriteMessage from '../util/messageUtils';

export function saveFavourite(actionContext, data, type) {
  actionContext.dispatch('SaveFavourite', {
    ...data,
    onFail: () => {
      actionContext.executeAction(
        addMessage,
        failedFavouriteMessage(type, true),
      );
    },
  });
}

export function updateFavourites(actionContext, data, type) {
  actionContext.dispatch('UpdateFavourites', {
    newFavourites: data,
    onFail: () => {
      actionContext.executeAction(
        addMessage,
        failedFavouriteMessage(type, true),
      );
    },
  });
}

export function deleteFavourite(actionContext, data, type) {
  actionContext.dispatch('DeleteFavourite', {
    ...data,
    onFail: () => {
      actionContext.executeAction(
        addMessage,
        failedFavouriteMessage(type, false),
      );
    },
  });
}

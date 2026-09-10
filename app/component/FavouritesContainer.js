import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import AutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import FavouriteBar from '@digitransit-component/digitransit-component-favourite-bar';
import FavouriteModal from '@digitransit-component/digitransit-component-favourite-modal';
import FavouriteEditModal from '@digitransit-component/digitransit-component-favourite-editing-modal';
import { useIntl } from 'react-intl';
import LoginPrompt from './LoginPrompt';
import {
  withSearchContext,
  getLocationSearchTargets,
} from './WithSearchContext';
import {
  useFavourites,
  useFavouriteStatus,
  useFavouriteActions,
} from '../hooks/FavouriteContext';
import { STATUS_FETCHING_OR_UPDATING } from '../data/FavouriteData';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { useConfigContext } from '../configurations/ConfigContext';

const AutoSuggestWithSearchContext = withSearchContext(AutoSuggest);

function FavouritesContainer({ onClickFavourite, isMobile = false }) {
  const intl = useIntl();
  const config = useConfigContext();
  const favourites = useFavourites();
  const favouriteStatus = useFavouriteStatus() || STATUS_FETCHING_OR_UPDATING;
  const { saveFavourite, deleteFavourite, updateFavourites } =
    useFavouriteActions();
  const closeModalTimeoutRef = useRef(null);

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [favourite, setFavourite] = useState(null);

  useEffect(() => {
    return () => {
      if (closeModalTimeoutRef.current) {
        clearTimeout(closeModalTimeoutRef.current);
      }
    };
  }, []);

  const lang = config.language;
  const { fontWeights } = config;

  const enabled =
    config.allowFavouritesFromLocalstorage || config.user?.sub !== undefined;

  const isLoading = favouriteStatus === STATUS_FETCHING_OR_UPDATING;

  const favouritePlaces = enabled
    ? favourites.filter(item => item.type === 'place')
    : [];

  const clearFavouriteAfterModalAnimation = () => {
    if (closeModalTimeoutRef.current) {
      clearTimeout(closeModalTimeoutRef.current);
    }

    closeModalTimeoutRef.current = setTimeout(() => {
      setFavourite(null);
    }, 250);
  };

  const setLocationProperties = item => {
    setFavourite(previousFavourite => ({
      ...item,
      name: previousFavourite?.name || '',
      defaultName: item.name || item.address,
    }));
  };

  const addHome = () => {
    addAnalyticsEvent({
      event: 'add_favorite_press',
      favorite_type: 'place',
    });

    setAddModalOpen(true);
    setFavourite({
      name: intl.formatMessage({
        id: 'location-home',
        defaultMessage: 'Home',
      }),
      selectedIconId: 'icon-icon_home',
    });
  };

  const addWork = () => {
    addAnalyticsEvent({
      event: 'add_favorite_press',
      favorite_type: 'place',
    });

    setAddModalOpen(true);
    setFavourite({
      name: intl.formatMessage({
        id: 'location-work',
        defaultMessage: 'Work',
      }),
      selectedIconId: 'icon-icon_work',
    });
  };

  const saveSelectedFavourite = favouriteToSave => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'SaveFavourite',
      name: null,
    });

    saveFavourite(favouriteToSave);
  };

  const deleteSelectedFavourite = favouriteToDelete => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'DeleteFavourite',
      name: null,
    });

    deleteFavourite(favouriteToDelete);
  };

  const updateFavouriteOrder = updatedFavouritePlaces => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'UpdateFavourite',
      name: null,
    });

    // Backend service requires all favourites for reordering to work.
    const reordered = [
      ...updatedFavouritePlaces,
      ...favourites.filter(item => item.type !== 'place'),
    ];

    updateFavourites(reordered);
  };

  const editSelectedFavourite = currentFavourite => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'EditFavourite',
      name: null,
    });

    setFavourite(currentFavourite);
    setEditModalOpen(false);
    setAddModalOpen(true);
  };

  const closeModal = isAddModal => {
    if (isAddModal) {
      addAnalyticsEvent({
        category: 'Favourite',
        action: 'CloseAddModal',
        name: null,
      });

      setAddModalOpen(false);
    } else {
      addAnalyticsEvent({
        category: 'Favourite',
        action: 'CloseEditModal',
        name: null,
      });

      setEditModalOpen(false);
      setFavourite(null);
    }

    clearFavouriteAfterModalAnimation();
  };

  const cancelSelected = () => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'CancelUpdate',
      name: null,
    });

    setAddModalOpen(false);
    setEditModalOpen(true);

    clearFavouriteAfterModalAnimation();
  };

  return (
    <>
      <FavouriteBar
        favourites={favouritePlaces}
        onClickFavourite={onClickFavourite}
        onAddPlace={() =>
          enabled ? setAddModalOpen(true) : setLoginModalOpen(true)
        }
        onEdit={() =>
          enabled ? setEditModalOpen(true) : setLoginModalOpen(true)
        }
        onAddHome={() => (enabled ? addHome() : setLoginModalOpen(true))}
        onAddWork={() => (enabled ? addWork() : setLoginModalOpen(true))}
        lang={lang}
        isLoading={isLoading}
        colors={config.colors}
        fontWeights={fontWeights}
      />

      <FavouriteModal
        appElement="#app"
        isModalOpen={addModalOpen}
        handleClose={() => closeModal(true)}
        saveFavourite={saveSelectedFavourite}
        cancelSelected={cancelSelected}
        favourite={favourite}
        lang={lang}
        isMobile={isMobile}
        fontWeights={fontWeights}
        colors={config.colors}
        autosuggestComponent={
          <AutoSuggestWithSearchContext
            appElement="#app"
            sources={['History', 'Datasource']}
            targets={getLocationSearchTargets(config, true)}
            id="favourite"
            icon="search"
            placeholder="search-address-or-place"
            value={favourite?.address || ''}
            selectHandler={setLocationProperties}
            getAutoSuggestIcons={config.getAutoSuggestIcons}
            lang={lang}
            isMobile={isMobile}
            fontWeights={fontWeights}
            required
            colors={config.colors}
            modeSet={config.iconModeSet}
            favouriteContext
          />
        }
      />

      <FavouriteEditModal
        appElement="#app"
        isModalOpen={editModalOpen}
        favourites={favouritePlaces}
        updateFavourites={updateFavouriteOrder}
        handleClose={() => closeModal(false)}
        saveFavourite={saveSelectedFavourite}
        deleteFavourite={deleteSelectedFavourite}
        onEditSelected={editSelectedFavourite}
        lang={lang}
        isMobile={isMobile}
        isLoading={isLoading}
        colors={config.colors}
        fontWeights={fontWeights}
      />

      <LoginPrompt
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
}

FavouritesContainer.propTypes = {
  onClickFavourite: PropTypes.func.isRequired,
  isMobile: PropTypes.bool,
};

export default FavouritesContainer;

import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import suggestionToLocation from '@digitransit-search-util/digitransit-search-util-suggestion-to-location';
import AutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import FavouriteBar from '@digitransit-component/digitransit-component-favourite-bar';
import FavouriteModal from '@digitransit-component/digitransit-component-favourite-modal';
import FavouriteEditModal from '@digitransit-component/digitransit-component-favourite-editing-modal';
import withSearchContext from './WithSearchContext';
import {
  saveFavourite,
  updateFavourites,
  deleteFavourite,
} from '../action/FavouriteActions';
import FavouriteStore from '../store/FavouriteStore';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const AutoSuggestWithSearchContext = withSearchContext(AutoSuggest);

const favouriteShape = PropTypes.shape({
  type: PropTypes.string,
  address: PropTypes.string,
  gtfsId: PropTypes.string,
  gid: PropTypes.string,
  lat: PropTypes.number,
  lon: PropTypes.number,
  name: PropTypes.string,
  selectedIconId: PropTypes.string,
  favouriteId: PropTypes.string,
  layer: PropTypes.string,
});

class FavouritesContainer extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
  };

  static propTypes = {
    favourites: PropTypes.arrayOf(favouriteShape),
    onClickFavourite: PropTypes.func.isRequired,
    lang: PropTypes.string,
    isMobile: PropTypes.bool,
    favouriteStatus: PropTypes.string,
  };

  static defaultProps = {
    favourites: [],
    isMobile: false,
    favouriteStatus: FavouriteStore.STATUS_FETCHING,
  };

  constructor(props) {
    super(props);
    this.state = {
      addModalOpen: false,
      editModalOpen: false,
      favourite: null,
    };
  }

  setLocationProperties = item => {
    const location =
      item.type === 'CurrentLocation' ? item : suggestionToLocation(item);
    this.setState(prevState => ({
      favourite: {
        ...location,
        name: (prevState.favourite && prevState.favourite.name) || '',
        defaultName: item.name || item.properties.name,
      },
    }));
  };

  addHome = () => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'AddHome',
      name: null,
    });
    this.setState({
      addModalOpen: true,
      favourite: {
        name: this.context.intl.formatMessage({
          id: 'location-home',
          defaultMessage: 'Home',
        }),
        selectedIconId: 'icon-icon_home',
      },
    });
  };

  addWork = () => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'AddWork',
      name: null,
    });
    this.setState({
      addModalOpen: true,
      favourite: {
        name: this.context.intl.formatMessage({
          id: 'location-work',
          defaultMessage: 'Work',
        }),
        selectedIconId: 'icon-icon_work',
      },
    });
  };

  saveFavourite = favourite => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'SaveFavourite',
      name: null,
    });
    this.context.executeAction(saveFavourite, favourite);
  };

  deleteFavourite = favourite => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'DeleteFavourite',
      name: null,
    });
    this.context.executeAction(deleteFavourite, favourite);
  };

  updateFavourites = favourites => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'UpdateFavourite',
      name: null,
    });
    this.context.executeAction(updateFavourites, favourites);
  };

  editFavourite = currentFavourite => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'EditFavourite',
      name: null,
    });
    this.setState({
      favourite: currentFavourite,
      editModalOpen: false,
      addModalOpen: true,
    });
  };

  addPlace = () => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'AddPlace',
      name: null,
    });

    this.setState({
      addModalOpen: true,
    });
  };

  editPlace = () => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'EditPlace',
      name: null,
    });

    this.setState({
      editModalOpen: true,
    });
  };

  closeModal = isAddModal => {
    if (isAddModal) {
      addAnalyticsEvent({
        category: 'Favourite',
        action: 'CloseAddModal',
        name: null,
      });
      this.setState({
        addModalOpen: false,
      });
    } else {
      addAnalyticsEvent({
        category: 'Favourite',
        action: 'CloseEditModal',
        name: null,
      });
      this.setState({
        editModalOpen: false,
        favourite: null,
      });
    }
    // Modal close animation lasts 250ms
    setTimeout(() => {
      this.setState({ favourite: null });
    }, 250);
  };

  cancelSelected = () => {
    addAnalyticsEvent({
      category: 'Favourite',
      action: 'CancelUpdate',
      name: null,
    });
    this.setState({
      addModalOpen: false,
      editModalOpen: true,
    });
    // Modal close animation lasts 250ms
    setTimeout(() => {
      this.setState({ favourite: null });
    }, 250);
  };

  render() {
    const isLoading =
      this.props.favouriteStatus === FavouriteStore.STATUS_FETCHING_OR_UPDATING;
    return (
      <React.Fragment>
        <FavouriteBar
          favourites={this.props.favourites}
          onClickFavourite={this.props.onClickFavourite}
          onAddPlace={this.addPlace}
          onEdit={this.editPlace}
          onAddHome={this.addHome}
          onAddWork={this.addWork}
          lang={this.props.lang}
          isLoading={isLoading}
        />
        <FavouriteModal
          appElement="#app"
          isModalOpen={this.state.addModalOpen}
          handleClose={() => this.closeModal(true)}
          saveFavourite={this.saveFavourite}
          cancelSelected={this.cancelSelected}
          favourite={this.state.favourite}
          lang={this.props.lang}
          isMobile={this.props.isMobile}
          autosuggestComponent={
            <AutoSuggestWithSearchContext
              appElement="#app"
              sources={['History', 'Datasource']}
              targets={['Locations', 'CurrentPosition', 'Stops']}
              id="favourite"
              placeholder="search-address-or-place"
              value={
                (this.state.favourite && this.state.favourite.address) || ''
              }
              onFavouriteSelected={this.setLocationProperties}
              lang={this.props.lang}
              isMobile={this.props.isMobile}
            />
          }
        />
        <FavouriteEditModal
          appElement="#app"
          isModalOpen={this.state.editModalOpen}
          favourites={this.props.favourites}
          updateFavourites={this.updateFavourites}
          handleClose={() => this.closeModal(false)}
          saveFavourite={this.saveFavourite}
          deleteFavourite={this.deleteFavourite}
          onEditSelected={this.editFavourite}
          lang={this.props.lang}
          isMobile={this.props.isMobile}
          isLoading={isLoading}
        />
      </React.Fragment>
    );
  }
}

const connectedComponent = connectToStores(
  FavouritesContainer,
  ['FavouriteStore'],
  context => ({
    favourites: context
      .getStore('FavouriteStore')
      .getFavourites()
      .filter(item => item.type !== 'route'),
    favouriteStatus: context.getStore('FavouriteStore').getStatus(),
  }),
);

export { connectedComponent as default, FavouritesContainer as Component };

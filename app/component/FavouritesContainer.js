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
    this.context.executeAction(saveFavourite, favourite);
  };

  deleteFavourite = favourite => {
    this.context.executeAction(deleteFavourite, favourite);
  };

  updateFavourites = favourites => {
    this.context.executeAction(updateFavourites, favourites);
  };

  editFavourite = currentFavourite => {
    this.setState({
      favourite: currentFavourite,
      editModalOpen: false,
      addModalOpen: true,
    });
  };

  render() {
    const isLoading =
      this.props.favouriteStatus === FavouriteStore.STATUS_FETCHING_OR_UPDATING;
    return (
      <React.Fragment>
        <FavouriteBar
          favourites={this.props.favourites}
          onClickFavourite={this.props.onClickFavourite}
          onAddPlace={() => this.setState({ addModalOpen: true })}
          onEdit={() => this.setState({ editModalOpen: true })}
          onAddHome={this.addHome}
          onAddWork={this.addWork}
          lang={this.props.lang}
          isLoading={isLoading}
        />
        <FavouriteModal
          appElement="#app"
          isModalOpen={this.state.addModalOpen}
          handleClose={() => {
            this.setState({
              addModalOpen: false,
            });
            // Modal close animation lasts 250ms
            setTimeout(() => {
              this.setState({ favourite: null });
            }, 250);
          }}
          saveFavourite={this.saveFavourite}
          cancelSelected={() => {
            this.setState({
              addModalOpen: false,
              editModalOpen: true,
            });
            // Modal close animation lasts 250ms
            setTimeout(() => {
              this.setState({ favourite: null });
            }, 250);
          }}
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
          handleClose={() =>
            this.setState({ editModalOpen: false, favourite: null })
          }
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

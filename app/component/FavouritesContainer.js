import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import loadable from '@loadable/component';
import suggestionToLocation from '@digitransit-search-util/digitransit-search-util-suggestion-to-location';
import withSearchContext from './WithSearchContext';
import getRelayEnvironment from '../util/getRelayEnvironment';
import { updateFavourites } from '../action/FavouriteActions';

const AutoSuggestWithSearchContext = getRelayEnvironment(
  withSearchContext(
    loadable(
      () => import('@digitransit-component/digitransit-component-autosuggest'),
      { ssr: true },
    ),
  ),
);

const FavouriteBar = loadable(
  () => import('@digitransit-component/digitransit-component-favourite-bar'),
  { ssr: true },
);

const FavouriteModal = loadable(
  () => import('@digitransit-component/digitransit-component-favourite-modal'),
  { ssr: true },
);

const FavouriteEditModal = loadable(
  () =>
    import('@digitransit-component/digitransit-component-favourite-editing-modal'),
  { ssr: true },
);

const favouriteShape = PropTypes.shape({
  address: PropTypes.string,
  gtfsId: PropTypes.string,
  gid: PropTypes.string,
  lat: PropTypes.number,
  name: PropTypes.string,
  lon: PropTypes.number,
  selectedIconId: PropTypes.string,
  favouriteId: PropTypes.string,
});

class FavouritesContainer extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
  };

  static propTypes = {
    favourites: PropTypes.arrayOf(favouriteShape),
    onSaveFavourite: PropTypes.func.isRequired,
    onClickFavourite: PropTypes.func.isRequired,
    onDeleteFavourite: PropTypes.func.isRequired,
    lang: PropTypes.string,
    isMobile: PropTypes.bool,
  };

  static defaultProps = {
    favourites: [],
    isMobile: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      addModalOpen: false,
      editModalOpen: false,
      favourite: {},
    };
  }

  setLocationProperties = item => {
    const location =
      item.type === 'CurrentLocation' ? item : suggestionToLocation(item);
    this.setState({
      favourite: {
        ...location,
        defaultName: item.name || item.properties.name,
      },
    });
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
        />
        {this.state.addModalOpen && (
          <FavouriteModal
            handleClose={() =>
              this.setState({
                addModalOpen: false,
                favourite: {},
              })
            }
            saveFavourite={this.props.onSaveFavourite}
            cancelSelected={() =>
              this.setState({
                addModalOpen: false,
                editModalOpen: true,
                favourite: {},
              })
            }
            favourite={this.state.favourite}
            lang={this.props.lang}
            isMobile={this.props.isMobile}
            autosuggestComponent={
              <AutoSuggestWithSearchContext
                sources={['History', 'Datasource']}
                targets={['Locations', 'CurrentPosition', 'Stops']}
                id="favourite"
                placeholder="search-address-or-place"
                value={this.state.favourite.address || ''}
                onFavouriteSelected={this.setLocationProperties}
                lang={this.props.lang}
                isMobile={this.props.isMobile}
              />
            }
          />
        )}
        {this.state.editModalOpen && (
          <FavouriteEditModal
            favourites={this.props.favourites}
            updateFavourites={this.updateFavourites}
            handleClose={() =>
              this.setState({ editModalOpen: false, favourite: {} })
            }
            saveFavourite={this.props.onSaveFavourite}
            deleteFavourite={this.props.onDeleteFavourite}
            onEditSelected={this.editFavourite}
            lang={this.props.lang}
          />
        )}
      </React.Fragment>
    );
  }
}

export default FavouritesContainer;

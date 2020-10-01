import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { routerShape } from 'found';
import suggestionToLocation from '@digitransit-search-util/digitransit-search-util-suggestion-to-location';
import AutoSuggest from '@digitransit-component/digitransit-component-autosuggest';
import FavouriteBar from '@digitransit-component/digitransit-component-favourite-bar';
import FavouriteModal from '@digitransit-component/digitransit-component-favourite-modal';
import FavouriteEditModal from '@digitransit-component/digitransit-component-favourite-editing-modal';
import DialogModal from '@digitransit-component/digitransit-component-dialog-modal';
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
    router: routerShape.isRequired,
  };

  static propTypes = {
    favourites: PropTypes.arrayOf(favouriteShape),
    onClickFavourite: PropTypes.func.isRequired,
    lang: PropTypes.string,
    isMobile: PropTypes.bool,
    favouriteStatus: PropTypes.string,
    user: PropTypes.object,
  };

  static defaultProps = {
    favourites: [],
    isMobile: false,
    favouriteStatus: FavouriteStore.STATUS_FETCHING,
  };

  constructor(props) {
    super(props);
    this.state = {
      loginModalOpen: false,
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

  renderLoginModal = () => {
    const login = <FormattedMessage id="login" defaultMessage="Log in" />;
    const cancel = <FormattedMessage id="cancel" defaultMessage="cancel" />;
    return (
      <DialogModal
        appElement="#app"
        headerText="Hi!"
        handleClose={() => this.setState({ loginModalOpen: false })}
        variant="login"
        lang={this.props.lang}
        isModalOpen={this.state.loginModalOpen}
        primaryButtonText={login}
        primaryButtonOnClick={e => {
          e.preventDefault();
          window.location.replace('/login');
          this.setState({
            loginModalOpen: false,
          });
        }}
        secondaryButtonText={cancel}
        secondaryButtonOnClick={() =>
          this.setState({
            loginModalOpen: false,
          })
        }
      />
    );
  };

  render() {
    const isLoading =
      this.props.favouriteStatus === FavouriteStore.STATUS_FETCHING_OR_UPDATING;
    return (
      <React.Fragment>
        <FavouriteBar
          favourites={this.props.favourites}
          onClickFavourite={this.props.onClickFavourite}
          onAddPlace={() =>
            isEmpty(this.props.user)
              ? this.setState({ loginModalOpen: true })
              : this.setState({ addModalOpen: true })
          }
          onEdit={() => this.setState({ editModalOpen: true })}
          onAddHome={() =>
            isEmpty(this.props.user)
              ? this.setState({ loginModalOpen: true })
              : this.addHome()
          }
          onAddWork={() =>
            isEmpty(this.props.user)
              ? this.setState({ loginModalOpen: true })
              : this.addWork()
          }
          lang={this.props.lang}
          isLoading={isLoading}
        />
        <FavouriteModal
          appElement="#app"
          isModalOpen={this.state.addModalOpen}
          handleClose={() =>
            this.setState({
              addModalOpen: false,
              favourite: null,
            })
          }
          saveFavourite={this.saveFavourite}
          cancelSelected={() =>
            this.setState({
              addModalOpen: false,
              editModalOpen: true,
              favourite: null,
            })
          }
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
        {this.renderLoginModal()}
      </React.Fragment>
    );
  }
}

const connectedComponent = connectToStores(
  FavouritesContainer,
  ['FavouriteStore', 'UserStore'],
  context => ({
    favourites: context
      .getStore('FavouriteStore')
      .getFavourites()
      .filter(item => item.type !== 'route'),
    favouriteStatus: context.getStore('FavouriteStore').getStatus(),
    user: context.getStore('UserStore').getUser(),
  }),
);

export { connectedComponent as default, FavouritesContainer as Component };

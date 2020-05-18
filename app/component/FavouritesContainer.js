import PropTypes from 'prop-types';
import React from 'react';
import loadable from '@loadable/component';
import searchContext from '../util/searchContext';
import intializeSearchContext from '../util/DTSearchContextInitializer';
import getRelayEnvironment from '../util/getRelayEnvironment';

const FavouriteBar = loadable(
  () => import('@digitransit-component/digitransit-component-favourite-bar'),
  { ssr: true },
);

const FavouriteModal = loadable(
  () => import('@digitransit-component/digitransit-component-favourite-modal'),
  { ssr: true },
);

class FavouritesContainer extends React.Component {
  static contextTypes = {
    config: PropTypes.object.isRequired,
    getStore: PropTypes.func.isRequired,
  };

  static propTypes = {
    relayEnvironment: PropTypes.object.isRequired,
    favourites: PropTypes.arrayOf(
      PropTypes.shape({
        address: PropTypes.string,
        gtfsId: PropTypes.string,
        gid: PropTypes.string,
        lat: PropTypes.number,
        name: PropTypes.string,
        lon: PropTypes.number,
        selectedIconId: PropTypes.string,
        favouriteId: PropTypes.string,
      }),
    ),
    onAddFavourite: PropTypes.func,
    onClickFavourite: PropTypes.func,
    // lang: PropTypes.string,
  };

  static defaultProps = {
    favourites: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      isInitialized: false,
      modalOpen: false,
    };
  }

  initContext() {
    if (!this.state.isInitialized) {
      intializeSearchContext(
        this.context,
        searchContext,
        this.props.relayEnvironment,
      );
      this.setState({ isInitialized: true });
    }
  }

  render() {
    return (
      <React.Fragment>
        <FavouriteBar
          favourites={this.props.favourites}
          onClickFavourite={this.props.onClickFavourite}
          onAddPlace={() => this.setState({ modalOpen: true })}
        />
        {this.state.modalOpen && (
          <FavouriteModal
            show={this.state.modalOpen}
            searchContext={searchContext}
            config={this.context.config}
            handleClose={() => this.setState({ modalOpen: false })}
            addFavourite={this.props.onAddFavourite}
          />
        )}
      </React.Fragment>
    );
  }
}

export default getRelayEnvironment(FavouritesContainer);

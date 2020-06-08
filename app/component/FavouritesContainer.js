import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import loadable from '@loadable/component';
import suggestionToLocation from '@digitransit-search-util/digitransit-search-util-suggestion-to-location';
import withSearchContext from './WithSearchContext';
import getRelayEnvironment from '../util/getRelayEnvironment';

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
    intl: intlShape,
  };

  static propTypes = {
    favourites: PropTypes.arrayOf(favouriteShape),
    onAddFavourite: PropTypes.func,
    onClickFavourite: PropTypes.func,
    lang: PropTypes.string,
  };

  static defaultProps = {
    favourites: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      selectedLocation: {},
      prefilledFavourite: {},
    };
  }

  setLocationProperties = suggestion => {
    const location = suggestionToLocation(suggestion);
    this.setState({
      selectedLocation: {
        ...location,
        defaultName: suggestion.properties.name,
      },
    });
  };

  addHome = () => {
    this.setState({
      modalOpen: true,
      prefilledFavourite: {
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
      modalOpen: true,
      prefilledFavourite: {
        name: this.context.intl.formatMessage({
          id: 'location-work',
          defaultMessage: 'Work',
        }),
        selectedIconId: 'icon-icon_work',
      },
    });
  };

  render() {
    return (
      <React.Fragment>
        <FavouriteBar
          favourites={this.props.favourites}
          onClickFavourite={this.props.onClickFavourite}
          onAddPlace={() => this.setState({ modalOpen: true })}
          onAddHome={this.addHome}
          onAddWork={this.addWork}
          lang={this.props.lang}
        />
        {this.state.modalOpen && (
          <FavouriteModal
            handleClose={() =>
              this.setState({
                modalOpen: false,
                prefilledFavourite: {},
                selectedLocation: {},
              })
            }
            addFavourite={this.props.onAddFavourite}
            location={this.state.selectedLocation}
            prefilledFavourite={this.state.prefilledFavourite}
            lang={this.props.lang}
            autosuggestComponent={
              <AutoSuggestWithSearchContext
                sources={['History', 'Datasource']}
                targets={['Locations', 'CurrentPosition', 'Stops']}
                id="favourite"
                placeholder="search-address-or-place"
                value={this.state.selectedLocation.address || ''}
                onFavouriteSelected={this.setLocationProperties}
                lang={this.props.lang}
              />
            }
          />
        )}
      </React.Fragment>
    );
  }
}

export default FavouritesContainer;

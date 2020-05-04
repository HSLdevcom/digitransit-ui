import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { routerShape, locationShape } from 'react-router';
import { FormattedMessage, intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import Icon from './Icon';
import BackButton from './BackButton';
import FavouriteIconTable from './FavouriteIconTable';
import { addFavourite, deleteFavourite } from '../action/FavouriteActions';
import { isStop, isTerminal } from '../util/suggestionUtils';
import DTEndpointAutosuggest from './DTEndpointAutosuggest';
import { addAnalyticsEvent } from '../util/analyticsUtils';

class AddFavouriteContainer extends React.Component {
  static FavouriteIconIds = [
    'icon-icon_place',
    'icon-icon_home',
    'icon-icon_work',
    'icon-icon_sport',
    'icon-icon_school',
    'icon-icon_shopping',
  ];

  static FavouriteIconIdToNameMap = {
    'icon-icon_home': 'home',
    'icon-icon_work': 'work',
    'icon-icon_sport': 'sport',
    'icon-icon_school': 'school',
    'icon-icon_shopping': 'shopping',
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    getStore: PropTypes.func.isRequired,
  };

  static propTypes = {
    favourite: PropTypes.shape({
      address: PropTypes.string,
      gtfsId: PropTypes.string,
      gid: PropTypes.string,
      lat: PropTypes.number,
      name: PropTypes.string,
      lon: PropTypes.number,
      selectedIconId: PropTypes.string,
      version: PropTypes.number,
      favouriteId: PropTypes.string,
    }),
  };

  static defaultProps = {
    favourite: {
      address: undefined,
      lat: undefined,
      name: '',
      lon: undefined,
      selectedIconId: undefined,
    },
  };

  state = {
    favourite: { ...this.props.favourite },
  };

  setLocationProperties = location => {
    this.setState(prevState => ({
      favourite: {
        ...prevState.favourite,
        favouriteId: prevState.favourite.favouriteId,
        gid: location.id,
        gtfsId: location.gtfsId,
        code: location.code,
        layer: location.layer,
        lat: location.lat,
        lon: location.lon,
        address: location.address,
      },
    }));
  };

  isEdit = () =>
    this.props.favourite !== undefined &&
    this.props.favourite.favouriteId !== undefined;

  canSave = () =>
    !isEmpty(this.state.favourite.selectedIconId) &&
    isNumber(this.state.favourite.lat) &&
    isNumber(this.state.favourite.lon) &&
    !isEmpty(this.state.favourite.name);

  save = () => {
    if (this.canSave()) {
      if (
        (isStop(this.state.favourite) || isTerminal(this.state.favourite)) &&
        this.state.favourite.gtfsId
      ) {
        const favourite = isTerminal(this.state.favourite)
          ? { ...this.state.favourite, type: 'station' }
          : { ...this.state.favourite, type: 'stop' };

        this.context.executeAction(addFavourite, favourite);
      } else {
        this.context.executeAction(addFavourite, {
          ...this.state.favourite,
          type: 'place',
        });
      }
      addAnalyticsEvent({
        category: 'Favourite',
        action: 'SaveFavourite',
        name: this.state.favourite.selectedIconId,
      });
      this.quit();
    }
  };

  delete = () => {
    this.context.executeAction(deleteFavourite, this.state.favourite);
    this.quit();
  };

  quit = () => {
    this.context.router.goBack();
  };

  specifyName = event => {
    const name = event.target.value;
    this.setState(prevState => ({
      favourite: { ...prevState.favourite, name },
    }));
  };

  selectIcon = id => {
    this.setState(prevState => {
      const favourite = { ...prevState.favourite, selectedIconId: id };
      // If the user hasn't set a location name yet,
      // let's attempt to autodetermine it based on the icon they chose.
      if (isEmpty(favourite.name)) {
        let suggestedName = AddFavouriteContainer.FavouriteIconIdToNameMap[id];
        if (suggestedName) {
          // If there is a suggested name in the map,
          // attempt to translate it, then assign it to
          // the update favourite object.
          suggestedName = this.context.intl.formatMessage({
            id: `location-${suggestedName}`,
            defaultMessage: suggestedName,
          });
          favourite.name = suggestedName;
        }
      }
      return { favourite };
    });
  };

  render() {
    const { favourite } = this.state;
    const favouriteLayers = [
      'CurrentPosition',
      'Geocoding',
      'OldSearch',
      'Stops',
    ];

    return (
      <div className="fullscreen">
        <div className="add-favourite-container">
          <div className="button-container">
            <BackButton
              icon="icon-icon_close"
              color="#666"
              className="add-favourite-close-button"
            />
          </div>
          <div className="add-favourite-container__content small-12 small-centered columns">
            <header className="add-favourite-container__header row">
              <div className="cursor-pointer add-favourite-star small-1 columns">
                <Icon
                  className={cx('add-favourite-star__icon', 'selected')}
                  img="icon-icon_star"
                />
              </div>
              <div className="add-favourite-container__header-text small-11 columns">
                <h3>
                  {(!this.isEdit() && (
                    <FormattedMessage
                      id="add-location-to-favourites"
                      defaultMessage="Add an important location to your Favorites"
                    />
                  )) || (
                    <FormattedMessage
                      id="edit-favourites"
                      defaultMessage="Edit the location in the Favorites"
                    />
                  )}
                </h3>
              </div>
            </header>
            <div className="add-favourite-container__search search-form">
              <h4>
                <FormattedMessage
                  id="specify-location"
                  defaultMessage="Specify location"
                />
              </h4>
              <DTEndpointAutosuggest
                id="origin"
                refPoint={{ lat: 0, lon: 0 }}
                searchType="endpoint"
                placeholder="address"
                value={favourite.address || ''}
                layers={favouriteLayers}
                onLocationSelected={this.setLocationProperties}
                showSpinner
              />
            </div>
            <div className="add-favourite-container__give-name">
              <h4>
                <FormattedMessage
                  id="give-name-to-location"
                  defaultMessage="Give the location a descriptive name"
                />
              </h4>
              <div className="add-favourite-container__input-placeholder">
                <input
                  className="add-favourite-container__input"
                  value={favourite.name}
                  placeholder={this.context.intl.formatMessage({
                    id: 'location-examples',
                    defaultMessage: 'e.g. Home, Work, School,...',
                  })}
                  onChange={this.specifyName}
                />
              </div>
            </div>
            <div className="add-favourite-container__pick-icon">
              <h4>
                <FormattedMessage id="pick-icon" defaultMessage="Select icon" />
              </h4>
              <FavouriteIconTable
                selectedIconId={(() => {
                  if (favourite.selectedIconId !== 'undefined' || null) {
                    return favourite.selectedIconId;
                  }
                  return undefined;
                })()}
                favouriteIconIds={AddFavouriteContainer.FavouriteIconIds}
                handleClick={this.selectIcon}
              />
            </div>
            <div className="add-favourite-container__save">
              <button
                className={`add-favourite-container-button ${
                  this.canSave() ? '' : 'disabled'
                }`}
                onClick={this.save}
              >
                <FormattedMessage id="save" defaultMessage="Save" />
              </button>
            </div>
            {this.isEdit() && [
              <div key="delete" className="add-favourite-container__save">
                <button
                  className="add-favourite-container-button delete"
                  onClick={this.delete}
                >
                  <FormattedMessage id="delete" defaultMessage="Delete" />
                </button>
              </div>,
              <div key="cancel" className="add-favourite-container__save">
                <button
                  className="add-favourite-container-button cancel"
                  onClick={this.quit}
                >
                  <FormattedMessage id="cancel" defaultMessage="Cancel" />
                </button>
              </div>,
            ]}
          </div>
        </div>
      </div>
    );
  }
}

const AddFavouriteContainerWithFavourite = connectToStores(
  AddFavouriteContainer,
  ['FavouriteStore'],
  (context, props) => ({
    favourite: context
      .getStore('FavouriteStore')
      .getByFavouriteId(props.params.id),
  }),
);

export {
  AddFavouriteContainerWithFavourite as default,
  AddFavouriteContainer as Component,
};

import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { routerShape, locationShape } from 'react-router';
import { FormattedMessage, intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import without from 'lodash/without';
import Icon from './Icon';
import BackButton from './BackButton';
import FavouriteIconTable from './FavouriteIconTable';
import {
  addFavouriteLocation,
  deleteFavouriteLocation,
} from '../action/FavouriteActions';
import { getAllEndpointLayers } from '../util/searchUtils';
import DTEndpointAutosuggest from './DTEndpointAutosuggest';

class AddFavouriteContainer extends React.Component {
  static FavouriteIconIds = [
    'icon-icon_place',
    'icon-icon_home',
    'icon-icon_work',
    'icon-icon_sport',
    'icon-icon_school',
    'icon-icon_shopping',
  ];

  static contextTypes = {
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    getStore: PropTypes.func.isRequired,
  };

  static propTypes = {
    favourite: PropTypes.object, // if specified edit mode is activated
  };

  componentWillMount = () => {
    if (this.isEdit()) {
      this.setState({ favourite: this.props.favourite });
    } else {
      this.setState({
        favourite: {
          selectedIconId: undefined,
          lat: undefined,
          lon: undefined,
          locationName: undefined,
          address: undefined,
          version: 1,
        },
      });
    }
  };

  setCoordinatesAndAddress = location => {
    this.setState({
      favourite: {
        ...this.state.favourite,
        lat: location.lat,
        lon: location.lon,
        address: location.address,
      },
    });
  };

  isEdit = () =>
    this.props.favourite !== undefined && this.props.favourite.id !== undefined;

  canSave = () =>
    !isEmpty(this.state.favourite.selectedIconId) &&
    isNumber(this.state.favourite.lat) &&
    isNumber(this.state.favourite.lon) &&
    !isEmpty(this.state.favourite.locationName);

  save = () => {
    if (this.canSave()) {
      this.context.executeAction(addFavouriteLocation, this.state.favourite);
      this.quit();
    }
  };

  delete = () => {
    this.context.executeAction(deleteFavouriteLocation, this.state.favourite);
    this.quit();
  };

  quit = () => {
    this.context.router.goBack();
  };

  specifyName = event => {
    this.setState({
      favourite: { ...this.state.favourite, locationName: event.target.value },
    });
  };

  selectIcon = id => {
    this.setState({
      favourite: { ...this.state.favourite, selectedIconId: id },
    });
  };

  render() {
    const favourite = this.state.favourite;
    const favouriteLayers = without(getAllEndpointLayers(), 'FavouritePlace');

    return (
      <div className="fullscreen">
        <div className="add-favourite-container">
          <div className="button-container">
            <BackButton
              icon="icon-icon_close"
              color="#888"
              className="add-favourite-close-button"
            />
          </div>
          <row>
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
                  searchType="all"
                  placeholder="address"
                  value={favourite.address || ''}
                  layers={favouriteLayers}
                  onLocationSelected={this.setCoordinatesAndAddress}
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
                    value={favourite.locationName}
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
                  <FormattedMessage
                    id="pick-icon"
                    defaultMessage="Select icon"
                  />
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
                  className={`add-favourite-container-button ${this.canSave()
                    ? ''
                    : 'disabled'}`}
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
          </row>
        </div>
      </div>
    );
  }
}

const AddFavouriteContainerWithFavourite = connectToStores(
  AddFavouriteContainer,
  ['FavouriteLocationStore'],
  (context, props) => ({
    favourite:
      props.params.id !== undefined
        ? context
            .getStore('FavouriteLocationStore')
            .getById(parseInt(props.params.id, 10))
        : {},
  }),
);

export default AddFavouriteContainerWithFavourite;

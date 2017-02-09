import React, { PropTypes } from 'react';
import cx from 'classnames';
import { Link, routerShape, locationShape } from 'react-router';
import { FormattedMessage, intlShape } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import without from 'lodash/without';
import Icon from './Icon';
import FavouriteIconTable from './FavouriteIconTable';
import { addFavouriteLocation, deleteFavouriteLocation } from '../action/FavouriteActions';
import FakeSearchBar from './FakeSearchBar';
import OneTabSearchModal from './OneTabSearchModal';
import { getAllEndpointLayers } from '../util/searchUtils';

class AddFavouriteContainer extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    getStore: PropTypes.func.isRequired,
  };

  static propTypes = {
    favourite: PropTypes.object, // if specified edit mode is activated
  }

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
  }

  getFavouriteIconIds = () =>
    (['icon-icon_place', 'icon-icon_home', 'icon-icon_work', 'icon-icon_sport',
      'icon-icon_school', 'icon-icon_shopping']);

  setCoordinatesAndAddress = (name, location) => {
    let address = name;
    if (location.type === 'CurrentLocation') {
      const position = this.context.getStore('PositionStore').getLocationState();
      if (position.address.length > 0) {
        address = position.address;
      }
    }
    this.setState({ favourite: { ...this.state.favourite,
      lat: location.geometry.coordinates[1],
      lon: location.geometry.coordinates[0],
      address,
    } });
  };

  isEdit = () => this.props.favourite !== undefined && this.props.favourite.id !== undefined;

  canSave = () => (
    !isEmpty(this.state.favourite.selectedIconId) &&
    isNumber(this.state.favourite.lat) &&
    isNumber(this.state.favourite.lon) &&
    !isEmpty(this.state.favourite.locationName)
  );

  save = () => {
    if (this.canSave()) {
      this.context.executeAction(addFavouriteLocation, this.state.favourite);
      this.quit();
    }
  }

  delete = () => {
    this.context.executeAction(deleteFavouriteLocation, this.state.favourite);
    this.quit();
  }

  quit = () => {
    this.context.router.replace('/suosikit');
  }

  specifyName = (event) => {
    this.setState({ favourite: { ...this.state.favourite, locationName: event.target.value } });
  }

  selectIcon = (id) => {
    this.setState({ favourite: { ...this.state.favourite, selectedIconId: id } });
  };

  render() {
    const destinationPlaceholder = this.context.intl.formatMessage({
      id: 'address',
      defaultMessage: 'Address',
    });

    const searchTabLabel = this.context.intl.formatMessage({
      id: 'favourite-target',
      defaultMessage: 'Favourite location',
    });

    const favourite = this.state.favourite;
    const favouriteLayers = without(getAllEndpointLayers(), 'FavouritePlace');

    return (<div className="fullscreen">
      <div className="add-favourite-container">
        <Link to="/suosikit" className="right cursor-pointer">
          <Icon id="add-favourite-close-icon" img="icon-icon_close" />
        </Link>
        <row>
          <div className="add-favourite-container__content small-12 small-centered columns">
            <header className="add-favourite-container__header row">
              <div className="cursor-pointer add-favourite-star small-1 columns">
                <Icon className={cx('add-favourite-star__icon', 'selected')} img="icon-icon_star" />
              </div>
              <div className="add-favourite-container__header-text small-11 columns">
                <h3>{(!this.isEdit() &&
                  <FormattedMessage
                    id="add-location-to-favourites"
                    defaultMessage="Add an important location to your Favorites"
                  />) || <FormattedMessage
                    id="edit-favourites"
                    defaultMessage="Edit the location in the Favorites"
                  />}
                </h3>
              </div>
            </header>
            <div className="add-favourite-container__search search-form">
              <h4>
                <FormattedMessage id="specify-location" defaultMessage="Specify location" />
              </h4>
              <FakeSearchBar
                endpointAddress={(this.state != null ? favourite.address : undefined) || ''}
                placeholder={destinationPlaceholder}
                onClick={(e) => {
                  e.preventDefault();
                  this.context.router.push({
                    ...this.context.location,
                    state: {
                      ...this.context.location.state,
                      oneTabSearchModalOpen: true,
                    },
                  });
                }} id="destination" className="add-favourite-container__input-placeholder"
              />
            </div><div className="add-favourite-container__give-name">
              <h4>
                <FormattedMessage id="give-name-to-location" defaultMessage="Give the location a descriptive name" />
              </h4>
              <div className="add-favourite-container__input-placeholder">
                <input
                  className="add-favourite-container__input"
                  value={favourite.locationName}
                  placeholder={this.context.intl.formatMessage({
                    id: 'location-examples',
                    defaultMessage: 'e.g. Home, Work, School,...',
                  })} onChange={this.specifyName}
                />
              </div>
            </div>
            <div className="add-favourite-container__pick-icon">
              <h4><FormattedMessage id="pick-icon" defaultMessage="Select icon" /></h4>
              <FavouriteIconTable
                selectedIconId={(() => {
                  if (favourite.selectedIconId !== 'undefined' || null) {
                    return favourite.selectedIconId;
                  }
                  return undefined;
                })()} favouriteIconIds={this.getFavouriteIconIds()} handleClick={this.selectIcon}
              />
            </div>
            <div className="add-favourite-container__save">
              <div
                className={`add-favourite-container-button ${this.canSave() ? '' : 'disabled'}`}
                onClick={this.save}
              >
                <FormattedMessage id="save" defaultMessage="Save" />
              </div>
            </div>
            {this.isEdit() &&
              [(<div key="delete" className="add-favourite-container__save">
                <div
                  className="add-favourite-container-button delete" onClick={this.delete}
                >
                  <FormattedMessage id="delete" defaultMessage="Delete" />
                </div>
              </div>), (<div key="cancel" className="add-favourite-container__save">
                <div
                  className="add-favourite-container-button cancel" onClick={this.quit}
                >
                  <FormattedMessage id="cancel" defaultMessage="Cancel" />
                </div>
              </div>)]
            }
          </div>
        </row>
      </div>
      <OneTabSearchModal
        customTabLabel={searchTabLabel}
        layers={favouriteLayers}
        customOnSuggestionSelected={(name, item) => {
          this.setCoordinatesAndAddress(name, item);
          return this.context.router.goBack();
        }}
      /></div>);
  }
}

const AddFavouriteContainerWithFavourite = connectToStores(AddFavouriteContainer,
  ['FavouriteLocationStore'],
  (context, props) => (
    { favourite:
      props.params.id !== undefined ? context.getStore('FavouriteLocationStore')
        .getById(parseInt(props.params.id, 10)) : {},
    }
  ),
);

export default AddFavouriteContainerWithFavourite;

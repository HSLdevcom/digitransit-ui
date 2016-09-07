import React, { PropTypes } from 'react';
import cx from 'classnames';
import Link from 'react-router/lib/Link';
import { FormattedMessage, intlShape } from 'react-intl';
import Icon from '../icon/icon';
import FavouriteIconTable from './FavouriteIconTable';
import { addFavouriteLocation } from '../../action/FavouriteActions';
import FakeSearchBar from '../search/fake-search-bar';
import OneTabSearchModal from '../search/one-tab-search-modal';

class AddFavouriteContainer extends React.Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
  };

  propTypes = {
    className: PropTypes.string.isRequired,
  };

  constructor() {
    super();
    this.state = {
      selectedIconId: undefined,
      lat: undefined,
      lon: undefined,
      locationName: undefined,
      address: undefined,
      searchModalIsOpen: false,
    };
  }


  getFavouriteIconIds = () =>
    (['icon-icon_place', 'icon-icon_home', 'icon-icon_work', 'icon-icon_sport',
      'icon-icon_school', 'icon-icon_shopping']);

  setCoordinatesAndAddress = (name, location) => (
    this.setState({
      lat: location.geometry.coordinates[1],
      lon: location.geometry.coordinates[0],
      address: name,
    }));

  canSave = () => (
      this.state.selectedIconId !== undefined &&
      this.state.selectedIconId !== '' &&
      this.state.lat !== undefined &&
      this.state.lat !== '' &&
      this.state.lon !== undefined &&
      this.state.lon !== '' &&
      this.state.locationName !== undefined &&
      this.state.locationName !== ''
    );

  save = () => {
    if (this.canSave()) {
      this.context.executeAction(addFavouriteLocation, this.state);
      return this.context.router.replace('/');
    }
    return undefined;
  }

  specifyName = (event) => {
    const input = event.target.value;

    return this.setState({
      locationName: input,
    });
  }

  selectIcon = (id) => (
    this.setState({
      selectedIconId: id,
    })
  );

  closeSearchModal() {
    return this.setState({
      searchModalIsOpen: false,
    });
  }

  render() {
    const destinationPlaceholder = this.context.intl.formatMessage({
      id: 'address',
      defaultMessage: 'Address',
    });

    const searchTabLabel = this.context.intl.formatMessage({
      id: 'favourite-target',
      defaultMessage: 'Favourite place',
    });

    return (<div className="fullscreen">
      <div className={cx(this.props.className, 'add-favourite-container')}>
        <Link to="/" className="right cursor-pointer">
          <Icon id="add-favourite-close-icon" img="icon-icon_close" />
        </Link>
        <row>
          <div className="add-favourite-container__content small-12 small-centered columns">
            <header className="add-favourite-container__header row">
              <div className="cursor-pointer add-favourite-star small-1 columns">
                <Icon className={cx('add-favourite-star__icon', 'selected')} img="icon-icon_star" />
              </div>
              <div className="add-favourite-container__header-text small-11 columns">
                <h3>
                  <FormattedMessage
                    id="add-location-to-favourites"
                    defaultMessage="Add a location to your favourites tab"
                  />
                </h3>
              </div>
            </header>
            <div className="add-favourite-container__search search-form">
              <h4>
                <FormattedMessage id="specify-location" defaultMessage="Specify the location" />
              </h4>
              <FakeSearchBar
                endpoint={{ address: (this.state != null ? this.state.address : undefined) || '',
                }} placeholder={destinationPlaceholder} onClick={e => {
                  e.preventDefault();

                  return this.setState({
                    searchModalIsOpen: true,
                  });
                }} id="destination" className="add-favourite-container__input-placeholder"
              />
            </div><div className="add-favourite-container__give-name">
              <h4>
                <FormattedMessage id="give-name-to-location" defaultMessage="Name the location" />
              </h4>
              <div className="add-favourite-container__input-placeholder">
                <input
                  className="add-favourite-container__input"
                  placeholder={this.context.intl.formatMessage({
                    id: 'location-examples',
                    defaultMessage: 'e.g. Home, Work, Scool,...',
                  })} onChange={this.specifyName}
                />
              </div>
            </div>
            <div className="add-favourite-container__pick-icon">
              <h4><FormattedMessage id="pick-icon" defaultMessage="Select an icon" /></h4>
              <FavouriteIconTable
                selectedIconId={(() => {
                  if (this.state.selectedIconId !== 'undefined' || null) {
                    return this.state.selectedIconId;
                  }
                  return undefined;
                })()} favouriteIconIds={this.getFavouriteIconIds()} handleClick={this.selectIcon}
              />
            </div>
            <div className="add-favourite-container__save">
              <div
                className={this.canSave() ? 'add-favourite-container__save-button' :
                  'add-favourite-container__save-button--disabled'} onClick={this.save}
              >
                <FormattedMessage
                  id="save" defaultMessage="Save"
                />
              </div>
            </div>
          </div>
        </row>
      </div>
      <OneTabSearchModal
        modalIsOpen={this.state.searchModalIsOpen}
        closeModal={this.closeSearchModal}
        customTabLabel={searchTabLabel}
        initialValue=""
        customOnSuggestionSelected={(name, item) => {
          this.setCoordinatesAndAddress(name, item);
          return this.closeSearchModal();
        }}
      /></div>);
  }
}


export default AddFavouriteContainer;

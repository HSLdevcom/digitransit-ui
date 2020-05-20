/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import { FormattedMessage, intlShape } from 'react-intl';
import loadable from '@loadable/component';
import DTAutosuggestContainer from './WithSearchContext';
import DTModal from './DTModal';
import Icon from './Icon';
import FavouriteIconTable from './FavouriteIconTable';

const DTAutoSuggest = loadable(
  () => import('@digitransit-component/digitransit-component-autosuggest'),
  { ssr: true },
);
const isStop = ({ layer }) => layer === 'stop' || layer === 'favouriteStop';

const isTerminal = ({ layer }) =>
  layer === 'station' || layer === 'favouriteStation';

class FavouriteModal extends React.Component {
  static propTypes = {
    handleClose: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    addFavourite: PropTypes.func.isRequired,
    favourite: PropTypes.shape({
      address: PropTypes.string,
      gtfsId: PropTypes.string,
      gid: PropTypes.string,
      lat: PropTypes.number,
      name: PropTypes.string,
      lon: PropTypes.number,
      selectedIconId: PropTypes.string,
      favouriteId: PropTypes.string,
    }),
    addAnalyticsEvent: PropTypes.func,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
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

  static FavouriteIconIdToNameMap = {
    'icon-icon_home': 'home',
    'icon-icon_work': 'work',
    'icon-icon_sport': 'sport',
    'icon-icon_school': 'school',
    'icon-icon_shopping': 'shopping',
  };

  static favouriteIconIds = [
    'icon-icon_place',
    'icon-icon_home',
    'icon-icon_work',
    'icon-icon_sport',
    'icon-icon_school',
    'icon-icon_shopping',
  ];

  state = {
    favourite: { ...this.props.favourite },
    defaultName: '',
  };

  setLocationProperties = location => {
    this.setState(prevState => ({
      favourite: {
        ...prevState.favourite,
        favouriteId: prevState.favourite.favouriteId,
        gid: location.properties.gid,
        gtfsId: location.properties.gtfsId,
        code: location.properties.code,
        layer: location.properties.layer,
        lat: location.geometry.coordinates[1],
        lon: location.geometry.coordinates[0],
        address: location.properties.label,
      },
      defaultName: location.properties.name,
    }));
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
      // if (isEmpty(favourite.name)) {
      //   const suggestedName = FavouriteModal.FavouriteIconIdToNameMap[id];
      //   if (suggestedName) {
      //     // If there is a suggested name in the map,
      //     // attempt to translate it, then assign it to
      //     // the update favourite object.
      //     // suggestedName = this.context.intl.formatMessage({
      //     //   id: `location-${suggestedName}`,
      //     //   defaultMessage: suggestedName,
      //     // });
      //     favourite.name = suggestedName;
      //   }
      // }
      return { favourite };
    });
  };

  canSave = () =>
    !isEmpty(this.state.favourite.selectedIconId) &&
    isNumber(this.state.favourite.lat) &&
    isNumber(this.state.favourite.lon);

  save = () => {
    if (this.canSave()) {
      const name = isEmpty(this.state.favourite.name)
        ? this.state.defaultName
        : this.state.favourite.name;
      if (
        (isStop(this.state.favourite) || isTerminal(this.state.favourite)) &&
        this.state.favourite.gtfsId
      ) {
        const favourite = isTerminal(this.state.favourite)
          ? { ...this.state.favourite, type: 'station', name }
          : { ...this.state.favourite, type: 'stop', name };

        this.props.addFavourite(favourite);
      } else {
        this.props.addFavourite({
          ...this.state.favourite,
          type: 'place',
          name,
        });
      }
      if (this.props.addAnalyticsEvent) {
        this.props.addAnalyticsEvent({
          category: 'Favourite',
          action: 'SaveFavourite',
          name: this.state.favourite.selectedIconId,
        });
      }
      this.setState({
        favourite: {
          address: undefined,
          lat: undefined,
          name: '',
          lon: undefined,
          selectedIconId: undefined,
        },
      });
      this.props.handleClose();
    }
  };

  render = () => {
    const favouriteLayers = [
      'CurrentPosition',
      'Geocoding',
      'OldSearch',
      'Stops',
    ];
    const { favourite } = this.state;
    return (
      <DTModal show={this.props.show}>
        <div className="favourite-modal-container">
          <div className="favourite-modal-top">
            <div className="favourite-modal-header">Tallenna paikka</div>
            <div
              className="favourite-modal-close"
              role="button"
              tabIndex="0"
              onClick={() => this.props.handleClose()}
              aria-label={this.context.intl.formatMessage({
                id: 'close-favourite-module',
              })}
            >
              <Icon
                className="cursor-pointer"
                img="icon-icon_close"
                width={1}
                height={1}
                color="#007ac9"
              />
            </div>
          </div>
          <div className="favourite-modal-main">
            <div className="favourite-modal-location-search">
              <DTAutosuggestContainer
                className="favourite"
                type="field"
                id="favourite"
                refPoint={{ lat: 0, lon: 0 }}
                searchType="endpoint"
                placeholder="address"
                value={favourite.address || ''}
                layers={favouriteLayers}
                onFavouriteSelected={this.setLocationProperties}
                showSpinner
              />
              <DTAutosuggestContainer
                onFavouriteSelected={this.setLocationProperties}
              >
                <DTAutoSuggest
                  id="favourite"
                  autoFocus={false}
                  placeholder="address"
                  value={favourite.address || ''}
                  sources={['Favourite', 'History', 'Datasource']}
                  targets={['Stops', 'Routes']}
                />
              </DTAutosuggestContainer>
            </div>
            <div className="favourite-modal-name">
              <input
                className="favourite-modal-input"
                value={favourite.name || ''}
                placeholder="Anna paikalle nimi (vapaaehtoinen)"
                onChange={this.specifyName}
              />
            </div>
          </div>
          <div className="favourite-modal-text">Valitse paikan kuvake</div>
          <div className="favourite-modal-icons">
            <FavouriteIconTable
              selectedIconId={(() => {
                if (favourite.selectedIconId !== 'undefined' || null) {
                  return favourite.selectedIconId;
                }
                return undefined;
              })()}
              favouriteIconIds={FavouriteModal.favouriteIconIds}
              handleClick={this.selectIcon}
            />
          </div>
          <div className="favourite-modal-save">
            <button
              type="button"
              className={`favourite-modal-button ${
                this.canSave() ? '' : 'disabled'
              }`}
              onClick={this.save}
            >
              <FormattedMessage id="save" defaultMessage="Save" />
            </button>
          </div>
        </div>
      </DTModal>
    );
  };
}

export default FavouriteModal;

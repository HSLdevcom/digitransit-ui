/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import i18next from 'i18next';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import DTAutosuggestContainer from '@digitransit-component/digitransit-component-autosuggest';
import styles from './helpers/styles.scss';
import translations from './helpers/translations';

i18next.init({ lng: 'fi', resources: {} });

i18next.addResourceBundle('en', 'translation', translations.en);
i18next.addResourceBundle('fi', 'translation', translations.fi);
i18next.addResourceBundle('sv', 'translation', translations.sv);

const isStop = ({ layer }) => layer === 'stop' || layer === 'favouriteStop';

const isTerminal = ({ layer }) =>
  layer === 'station' || layer === 'favouriteStation';

const Modal = ({ children }) => {
  return (
    <div className={styles.favouriteModal}>
      <section className={styles.modalMain}>{children}</section>
    </div>
  );
};

Modal.propTypes = {
  children: PropTypes.node,
};

Modal.defaultProps = {
  children: [],
};

const FavouriteIconTable = ({
  favouriteIconIds,
  selectedIconId,
  handleClick,
}) => {
  const columns = favouriteIconIds.map(value => (
    <button
      type="button"
      key={value}
      className={cx(styles['favourite-icon-table-column'], {
        [styles['selected-icon']]: value === selectedIconId,
      })}
      onClick={() => handleClick(value)}
    >
      {/* <Icon img={value} height={1.125} width={1.125} /> */}
    </button>
  ));

  return (
    <div className={styles['generic-table']}>
      <div className={styles.row}>{columns}</div>
    </div>
  );
};

FavouriteIconTable.propTypes = {
  handleClick: PropTypes.func.isRequired,
  favouriteIconIds: PropTypes.array,
  selectedIconId: PropTypes.string,
};

class FavouriteModal extends React.Component {
  static propTypes = {
    handleClose: PropTypes.func.isRequired,
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
      <Modal>
        <div className={styles['favourite-modal-container']}>
          <div className={styles['favourite-modal-top']}>
            <div className={styles['favourite-modal-header']}>
              {i18next.t('save-place')}
            </div>
            <div
              className={styles['favourite-modal-close']}
              role="button"
              tabIndex="0"
              onClick={() => this.props.handleClose()}
              aria-label={this.context.intl.formatMessage({
                id: 'close-favourite-module',
              })}
            >
              {/* <Icon
                className={styles['cursor-pointer']}
                img="icon-icon_close"
                width={1}
                height={1}
                color="#007ac9"
              /> */}
            </div>
          </div>
          <div className={styles['favourite-modal-main']}>
            <div className={styles['favourite-modal-location-search']}>
              <DTAutosuggestContainer
                className={styles.favourite}
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
            </div>
            <div className={styles['favourite-modal-name']}>
              <input
                className={styles['favourite-modal-input']}
                value={favourite.name || ''}
                placeholder={i18next.t('input-placeholder')}
                onChange={this.specifyName}
              />
            </div>
          </div>
          <div className={styles['favourite-modal-text']}>
            {i18next.t('save-place')}
          </div>
          <div className={styles['favourite-modal-icons']}>
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
          <div className={styles['favourite-modal-save']}>
            <button
              type="button"
              className={`${styles['favourite-modal-button']} ${
                this.canSave() ? '' : styles.disabled
              }`}
              onClick={this.save}
            >
              {i18next.t('save')}
            </button>
          </div>
        </div>
      </Modal>
    );
  };
}

export default FavouriteModal;

/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import i18next from 'i18next';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import Icon from '@digitransit-component/digitransit-component-icon';
import Modal from '@hsl-fi/modal';
import styles from './helpers/styles.scss';
import translations from './helpers/translations';
import DesktopModal from './helpers/DesktopModal';
import MobileModal from './helpers/MobileModal';

i18next.init({ lng: 'fi', resources: {} });

Object.keys(translations).forEach(lang => {
  i18next.addResourceBundle(lang, 'translation', translations[lang]);
});

const FavouriteIconIdToNameMap = {
  'icon-icon_place': 'place',
  'icon-icon_home': 'home',
  'icon-icon_work': 'work',
  'icon-icon_sport': 'sport',
  'icon-icon_school': 'school',
  'icon-icon_shopping': 'shopping',
};

const FavouriteIconTableButton = ({
  value,
  selectedIconId,
  handleClick,
  color,
}) => {
  const [isHovered, setHover] = useState(false);
  const [isFocused, setFocus] = useState(false);
  const iconColor =
    value === FavouriteIconIdToNameMap[selectedIconId] || isHovered || isFocused
      ? '#ffffff'
      : color;
  return (
    <button
      type="button"
      className={cx(styles['favourite-icon-table-column'], styles[value], {
        [styles['selected-icon']]:
          value === FavouriteIconIdToNameMap[selectedIconId],
      })}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onClick={() => handleClick(value)}
    >
      <Icon img={value} color={iconColor} />
    </button>
  );
};

FavouriteIconTableButton.propTypes = {
  handleClick: PropTypes.func.isRequired,
  value: PropTypes.string,
  selectedIconId: PropTypes.string,
  color: PropTypes.string.isRequired,
};

const FavouriteIconTable = ({
  favouriteIconIds,
  selectedIconId,
  handleClick,
  color,
}) => {
  const columns = favouriteIconIds.map(value => (
    <FavouriteIconTableButton
      key={`favourite-icon-table-${value}`}
      value={value}
      selectedIconId={selectedIconId}
      handleClick={handleClick}
      color={color}
    />
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
  color: PropTypes.string.isRequired,
};

/**
 * @example
 * <FavouriteModal
 *   show={modalOpen}
 *   handleClose={handleClose}
 *   saveFavourite={onSaveFavourite}
 *   location={selectedLocation}
 *   favourite={favourite}
 *   lang={lang}
 *   autosuggestComponent={
 *     <AutoSuggest
 *       sources={['History', 'Datasource']}
 *       targets={['Locations', 'CurrentPosition']}
 *       id="favourite"
 *       autoFocus={false}
 *       placeholder="search-address-or-place"
 *       value={selectedLocation.address || ''}
 *       onFavouriteSelected={this.setLocationProperties}
 *       lang={lang}
 *     />
 *   }
 * />
 */
class FavouriteModal extends React.Component {
  static propTypes = {
    isModalOpen: PropTypes.bool.isRequired,
    /** Required.
     * @type{function} */
    handleClose: PropTypes.func.isRequired,
    /** Required.
     * @type{function} */
    saveFavourite: PropTypes.func.isRequired,
    /** Required. Only used when editing favourite.
     * @type{function} */
    cancelSelected: PropTypes.func,
    /** Optional.
     * Autosuggest component for searching new favourites.
     * @type{node}
     */
    autosuggestComponent: PropTypes.node,
    /** Optional.
     * Object to prefill input field for name and/or selected icon.
     * @type {object}
     * @property {string} type
     * @property {string} address
     * @property {string} gtfsId
     * @property {string} gid
     * @property {number} lat
     * @property {number} lon
     * @property {string} name
     * @property {string} selectedIconId
     * @property {string} favouriteId
     * @property {string} layer
     * @property {string} defaultName
     */
    favourite: PropTypes.shape({
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
      defaultName: PropTypes.string,
    }),
    /** Optional.
     * @type {function} */
    addAnalyticsEvent: PropTypes.func,
    /** Optional. Language, fi, en or sv.
     * @type {string} */
    lang: PropTypes.string,
    /** Optional. */
    isMobile: PropTypes.bool,
    appElement: PropTypes.string.isRequired,
    color: PropTypes.string,
    hoverColor: PropTypes.string,
  };

  static defaultProps = {
    cancelSelected: () => ({}),
    lang: 'fi',
    isMobile: false,
    favourite: null,
    color: '#007ac9',
    hoverColor: '#0062a1',
  };

  static favouriteIconIds = [
    'place',
    'home',
    'work',
    'sport',
    'school',
    'shopping',
  ];

  constructor(props) {
    super(props);
    i18next.changeLanguage(props.lang);
    this.state = {
      favourite: null,
    };
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    const prevFav = prevState.favourite;
    const nextFav = nextProps.favourite;

    if (isEmpty(nextFav)) {
      return {
        favourite: null,
      };
    }

    if (isEmpty(prevFav) && !isEmpty(nextFav)) {
      return {
        favourite: {
          ...nextFav,
        },
      };
    }
    if (
      !isEmpty(prevFav) &&
      !isEmpty(nextFav) &&
      (nextFav.address !== prevFav.address ||
        nextFav.lat !== prevFav.lat ||
        nextFav.lon !== prevFav.lon)
    ) {
      return {
        favourite: {
          ...prevFav,
          address: nextFav.address,
          lat: nextFav.lat,
          lon: nextFav.lon,
          gid: nextFav.gid || null,
          name: prevFav.name || nextFav.name || '',
          defaultName: nextFav.defaultName,
        },
      };
    }
    return null;
  };

  componentDidUpdate = prevProps => {
    if (prevProps.lang !== this.props.lang) {
      i18next.changeLanguage(this.props.lang);
    }
  };

  componentWillUnmount = () => {
    this.setState({ favourite: null });
  };

  specifyName = event => {
    const name = event.target.value;
    this.setState(prevState => ({
      favourite: { ...prevState.favourite, name },
    }));
  };

  selectIcon = id => {
    this.setState(prevState => ({
      favourite: {
        ...prevState.favourite,
        selectedIconId: `icon-icon_${id}`,
      },
    }));
  };

  isEdit = () =>
    this.state.favourite && this.state.favourite.favouriteId !== undefined;

  canSave = () =>
    this.state.favourite &&
    !isEmpty(this.state.favourite.selectedIconId) &&
    isNumber(this.state.favourite.lat) &&
    isNumber(this.state.favourite.lon);

  closeModal = () => {
    this.props.handleClose();
    // hsl-fi/modal close animation lasts 250ms
    setTimeout(() => {
      this.setState({ favourite: null });
    }, 250);
  };

  cancelSelected = () => {
    this.props.cancelSelected();
    // hsl-fi/modal close animation lasts 250ms
    setTimeout(() => {
      this.setState({ favourite: null });
    }, 250);
  };

  save = () => {
    if (this.canSave()) {
      const name = isEmpty(this.state.favourite.name)
        ? this.state.favourite.defaultName
        : this.state.favourite.name;

      const favourite = { ...this.state.favourite, name };
      delete favourite.defaultName;
      this.props.saveFavourite({ ...favourite, type: 'place' });
      if (this.props.addAnalyticsEvent) {
        this.props.addAnalyticsEvent({
          category: 'Favourite',
          action: 'SaveFavourite',
          name: this.state.favourite.selectedIconId,
        });
      }
      if (this.isEdit() && this.props.cancelSelected) {
        this.cancelSelected();
      } else {
        this.closeModal();
      }
    }
  };

  render = () => {
    const { favourite } = this.state;
    const { color, hoverColor } = this.props;
    const headerText = this.isEdit()
      ? i18next.t('edit-place')
      : i18next.t('save-place');
    const modalProps = {
      headerText,
      autosuggestComponent: {
        ...this.props.autosuggestComponent,
        color,
        hoverColor,
      },
      inputPlaceholder: i18next.t('input-placeholder'),
      specifyName: this.specifyName,
      name: (favourite && favourite.name) || '',
      chooseIconText: i18next.t('choose-icon'),
      favouriteIconTable: (
        <FavouriteIconTable
          selectedIconId={(() => {
            if ((favourite && favourite.selectedIconId !== undefined) || null) {
              return favourite.selectedIconId;
            }
            return undefined;
          })()}
          favouriteIconIds={FavouriteModal.favouriteIconIds}
          handleClick={this.selectIcon}
          color={this.props.color}
        />
      ),
      saveFavourite: this.save,
      saveText: i18next.t('save'),
      canSave: this.canSave,
      isEdit: this.isEdit(),
      cancelText: i18next.t('cancel'),
      cancelSelected: () => this.cancelSelected(),
      color,
      hoverColor,
    };
    return (
      <Modal
        appElement={this.props.appElement}
        contentLabel={
          this.isEdit()
            ? i18next.t('favourite-modal-on-edit', favourite)
            : i18next.t('favourite-modal-on-add-new')
        }
        closeButtonLabel={i18next.t('close-favourite-modal')}
        variant={!this.props.isMobile ? 'small' : 'large'}
        isOpen={this.props.isModalOpen}
        onCrossClick={() => this.closeModal()}
      >
        {!this.props.isMobile && <DesktopModal {...modalProps} />}
        {this.props.isMobile && <MobileModal {...modalProps} />}
      </Modal>
    );
  };
}

export default FavouriteModal;

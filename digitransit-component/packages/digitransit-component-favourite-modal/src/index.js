/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {
  I18nextProvider,
  useTranslation,
  withTranslation,
} from 'react-i18next';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import Modal from '@hsl-fi/modal';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './helpers/styles.scss';
import i18n from './helpers/i18n';
import DesktopModal from './helpers/DesktopModal';
import MobileModal from './helpers/MobileModal';

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
  lang,
}) => {
  const [t] = useTranslation();
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
      aria-label={t(value, { lng: lang })}
    >
      <Icon img={value} color={iconColor} />
    </button>
  );
};

FavouriteIconTableButton.propTypes = {
  handleClick: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  selectedIconId: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  lang: PropTypes.string.isRequired,
};

const FavouriteIconTable = ({
  favouriteIconIds,
  selectedIconId,
  handleClick,
  color,
  lang,
}) => {
  const columns = favouriteIconIds.map(value => (
    <FavouriteIconTableButton
      key={`favourite-icon-table-${value}`}
      value={value}
      selectedIconId={selectedIconId}
      handleClick={handleClick}
      color={color}
      lang={lang}
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
  favouriteIconIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedIconId: PropTypes.string,
  color: PropTypes.string.isRequired,
  lang: PropTypes.string.isRequired,
};

FavouriteIconTable.defaultProps = {
  selectedIconId: '',
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
    /** Translation function */
    t: PropTypes.func.isRequired,
    /** Optional. */
    isMobile: PropTypes.bool,
    appElement: PropTypes.string.isRequired,
    color: PropTypes.string,
    hoverColor: PropTypes.string,
    /** Optional. */
    fontWeights: PropTypes.shape({
      /** Default value is 500. */
      medium: PropTypes.number,
    }),
  };

  static defaultProps = {
    cancelSelected: () => ({}),
    lang: 'fi',
    isMobile: false,
    favourite: null,
    autosuggestComponent: undefined,
    addAnalyticsEvent: undefined,
    color: '#007ac9',
    hoverColor: '#0062a1',
    fontWeights: {
      medium: 500,
    },
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
    this.state = {
      favourite: null,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
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
  }

  componentWillUnmount() {
    this.setState({ favourite: null });
  }

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

  render() {
    const { favourite } = this.state;
    const { color, hoverColor, fontWeights, lang, t } = this.props;
    const headerText = this.isEdit()
      ? t('edit-place', { lng: lang })
      : t('save-place', { lng: lang });
    const modalProps = {
      headerText,
      autosuggestComponent: {
        ...this.props.autosuggestComponent,
        color,
        hoverColor,
      },
      inputPlaceholder: t('input-placeholder', { lng: lang }),
      specifyName: this.specifyName,
      name: (favourite && favourite.name) || '',
      chooseIconText: t('choose-icon', { lng: lang }),
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
          color={color}
          lang={lang}
        />
      ),
      saveFavourite: this.save,
      saveText: t('save', { lng: lang }),
      canSave: this.canSave,
      isEdit: this.isEdit(),
      cancelText: t('cancel', { lng: lang }),
      cancelSelected: () => this.cancelSelected(),
      color,
      hoverColor,
      savePlaceText: t('save-place', { lng: lang }),
      cantSaveText: t('cannot-save-place', { lng: lang }),
      requiredText: t('required-text', { lng: lang }),
      fontWeights,
    };
    return (
      <Modal
        appElement={this.props.appElement}
        contentLabel={
          this.isEdit()
            ? t('favourite-modal-on-edit', { lng: lang, favourite })
            : t('favourite-modal-on-add-new', { lng: lang })
        }
        closeButtonLabel={t('close-favourite-modal', { lng: lang })}
        variant={!this.props.isMobile ? 'small' : 'large'}
        isOpen={this.props.isModalOpen}
        onCrossClick={() => this.closeModal()}
      >
        {!this.props.isMobile && <DesktopModal {...modalProps} />}
        {this.props.isMobile && <MobileModal {...modalProps} />}
      </Modal>
    );
  }
}

const FavouriteModalWithTranslation = withTranslation()(FavouriteModal);

export default props => (
  <I18nextProvider i18n={i18n}>
    <FavouriteModalWithTranslation {...props} />
  </I18nextProvider>
);

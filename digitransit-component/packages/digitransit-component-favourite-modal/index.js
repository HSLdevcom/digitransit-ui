/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import i18next from 'i18next';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import Icon from '@digitransit-component/digitransit-component-icon';
import styles from './helpers/styles.scss';
import translations from './helpers/translations';
import DesktopModal from './helpers/DesktopModal';
import MobileModal from './helpers/MobileModal';

i18next.init({ lng: 'fi', resources: {} });

i18next.addResourceBundle('en', 'translation', translations.en);
i18next.addResourceBundle('fi', 'translation', translations.fi);
i18next.addResourceBundle('sv', 'translation', translations.sv);

const isStop = ({ layer }) => layer === 'stop' || layer === 'favouriteStop';

const isTerminal = ({ layer }) =>
  layer === 'station' || layer === 'favouriteStation';

const Modal = ({ children, isEdit }) => {
  return (
    <div className={styles.favouriteModal}>
      <section
        className={cx(styles.modalMain, {
          [styles['edit-modal']]: isEdit,
        })}
      >
        {children}
      </section>
    </div>
  );
};

Modal.propTypes = {
  children: PropTypes.node,
  isEdit: PropTypes.bool,
};

Modal.defaultProps = {
  children: [],
  isEdit: false,
};

const FavouriteIconIdToNameMap = {
  'icon-icon_place': 'place',
  'icon-icon_home': 'home',
  'icon-icon_work': 'work',
  'icon-icon_sport': 'sport',
  'icon-icon_school': 'school',
  'icon-icon_shopping': 'shopping',
};
const FavouriteIconTableButton = ({ value, selectedIconId, handleClick }) => {
  const [isHovered, setHover] = useState(false);
  const iconColor =
    value === FavouriteIconIdToNameMap[selectedIconId] || isHovered
      ? '#ffffff'
      : '#007ac9';
  return (
    <button
      type="button"
      className={cx(styles['favourite-icon-table-column'], styles[value], {
        [styles['selected-icon']]:
          value === FavouriteIconIdToNameMap[selectedIconId],
      })}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
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
};

const FavouriteIconTable = ({
  favouriteIconIds,
  selectedIconId,
  handleClick,
}) => {
  const columns = favouriteIconIds.map(value => (
    <FavouriteIconTableButton
      key={`favourite-icon-table-${value}`}
      value={value}
      selectedIconId={selectedIconId}
      handleClick={handleClick}
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
 *       targets={['Locations', 'CurrentPosition', 'Stops']}
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
  };

  static defaultProps = {
    cancelSelected: () => ({}),
    lang: 'fi',
    isMobile: false,
    favourite: {
      name: '',
      type: undefined,
      address: undefined,
      gtfsId: undefined,
      gid: undefined,
      lat: undefined,
      lon: undefined,
      selectedIconId: undefined,
      favouriteId: undefined,
      layer: undefined,
      defaultName: undefined,
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
    i18next.changeLanguage(props.lang);
    this.state = {
      favourite: props.favourite,
    };
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    const nextFav = nextProps.favourite;
    const prevFav = prevState.favourite;
    if (nextFav.lat !== prevFav.lat || nextFav.lon !== prevFav.lon) {
      return {
        favourite: {
          ...prevFav,
          ...nextFav,
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
    this.setState({ favourite: {} });
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

  isEdit = () => this.state.favourite.favouriteId !== undefined;

  canSave = () =>
    !isEmpty(this.state.favourite.selectedIconId) &&
    isNumber(this.state.favourite.lat) &&
    isNumber(this.state.favourite.lon);

  save = () => {
    if (this.canSave()) {
      const name = isEmpty(this.state.favourite.name)
        ? this.state.favourite.defaultName
        : this.state.favourite.name;
      const favourite = {
        ...this.state.favourite,
        name,
      };
      if (
        (isStop(this.state.favourite) || isTerminal(this.state.favourite)) &&
        this.state.favourite.gtfsId
      ) {
        const type = isTerminal(this.state.favourite) ? 'station' : 'stop';
        this.props.saveFavourite({
          ...favourite,
          type,
          selectedIconId: this.state.favourite.selectedIconId,
        });
      } else {
        this.props.saveFavourite({
          ...favourite,
          type: 'place',
          selectedIconId: this.state.favourite.selectedIconId,
        });
      }
      if (this.props.addAnalyticsEvent) {
        this.props.addAnalyticsEvent({
          category: 'Favourite',
          action: 'SaveFavourite',
          name: this.state.favourite.selectedIconId,
        });
      }
      this.props.handleClose();
    }
  };

  render = () => {
    const { favourite } = this.state;
    const headerText = this.isEdit()
      ? i18next.t('edit-place')
      : i18next.t('save-place');
    const modalProps = {
      headerText,
      closeArialLabel: i18next.t('close-favourite-modal'),
      autosuggestComponent: this.props.autosuggestComponent,
      closeModal: this.props.handleClose,
      inputPlaceholder: i18next.t('input-placeholder'),
      specifyName: this.specifyName,
      name: favourite.name || '',
      chooseIconText: i18next.t('choose-icon'),
      favouriteIconTable: (
        <FavouriteIconTable
          selectedIconId={(() => {
            if (favourite.selectedIconId !== undefined || null) {
              return favourite.selectedIconId;
            }
            return undefined;
          })()}
          favouriteIconIds={FavouriteModal.favouriteIconIds}
          handleClick={this.selectIcon}
        />
      ),
      saveFavourite: this.save,
      saveText: i18next.t('save'),
      canSave: this.canSave,
      isEdit: this.isEdit(),
      cancelText: i18next.t('cancel'),
      cancelSelected: this.props.cancelSelected,
    };
    return (
      <Modal isEdit={this.isEdit()}>
        {!this.props.isMobile && <DesktopModal {...modalProps} />}
        {this.props.isMobile && <MobileModal {...modalProps} />}
      </Modal>
    );
  };
}

export default FavouriteModal;

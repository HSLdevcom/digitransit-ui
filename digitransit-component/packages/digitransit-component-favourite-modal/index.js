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

const FavouriteIconIdToNameMap = {
  'icon-icon_home': 'home',
  'icon-icon_work': 'work',
  'icon-icon_sport': 'sport',
  'icon-icon_school': 'school',
  'icon-icon_shopping': 'shopping',
};
const FavouriteIconTableButton = ({
  key,
  value,
  selectedIconId,
  handleClick,
}) => {
  const [isHovered, setHover] = useState(false);
  const iconColor =
    value === FavouriteIconIdToNameMap[selectedIconId] || isHovered
      ? '#ffffff'
      : '#007ac9';
  return (
    <button
      type="button"
      key={key}
      className={cx(styles['favourite-icon-table-column'], {
        [styles['selected-icon']]:
          value === FavouriteIconIdToNameMap[selectedIconId],
      })}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => handleClick(value)}
    >
      <Icon img={value} height={1.125} width={1.125} color={iconColor} />
    </button>
  );
};

FavouriteIconTableButton.propTypes = {
  handleClick: PropTypes.func.isRequired,
  key: PropTypes.string,
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
      key={value}
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
 *   addFavourite={onAddFavourite}
 *   location={selectedLocation}
 *   prefilledFavourite={prefilledFavourite}
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
    addFavourite: PropTypes.func.isRequired,
    /** Optional.
     * Autosuggest component for searching new favourites.
     * @type{node}
     */
    autosuggestComponent: PropTypes.node,
    /** Optional.
     * @type{object}
     * @property {string} address
     * @property {string} gtfsId
     * @property {number} lat
     * @property {number} lon
     * @property {string} id
     * @property {string} layer
     * @property {string} defaultName
     */
    location: PropTypes.shape({
      address: PropTypes.string,
      gtfsId: PropTypes.string,
      gid: PropTypes.string,
      lat: PropTypes.number,
      lon: PropTypes.number,
      layer: PropTypes.string,
      defaultName: PropTypes.string,
    }),
    /** Optional.
     * Object to prefill input field for name and/or selected icon.
     * @type{object}
     *  @property {string} name
     *  @property {string} selectedIconId
     */
    prefilledFavourite: PropTypes.shape({
      name: PropTypes.string,
      selectedIconId: PropTypes.string,
    }),
    /** Optional.
     * @type{function} */
    addAnalyticsEvent: PropTypes.func,
    /** Optional. Language, fi, en or sv.
     * @type{string} */
    lang: PropTypes.string,
    /** Optional. */
    isMobile: PropTypes.bool,
  };

  static defaultProps = {
    lang: 'fi',
    prefilledFavourite: {
      name: undefined,
      selectedIconId: undefined,
    },
    isMobile: false,
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
      name: props.prefilledFavourite.name || '',
      selectedIconId: props.prefilledFavourite.selectedIconId || null,
    };
  }

  componentDidMount = () => {
    i18next.changeLanguage(this.props.lang);
  };

  componentDidUpdate = prevProps => {
    if (prevProps.lang !== this.props.lang) {
      i18next.changeLanguage(this.props.lang);
    }
  };

  componentWillUnmount = () => {
    this.setState({ name: '', selectedIconId: null });
  };

  specifyName = event => {
    const input = event.target.value;
    this.setState({
      name: input,
    });
  };

  selectIcon = id => {
    this.setState({
      selectedIconId: `icon-icon_${id}`,
    });
  };

  canSave = () =>
    !isEmpty(this.state.selectedIconId) &&
    isNumber(this.props.location.lat) &&
    isNumber(this.props.location.lon);

  save = () => {
    if (this.canSave()) {
      const name = isEmpty(this.state.name)
        ? this.props.location.defaultName
        : this.state.name;
      const favourite = {
        name,
        address: this.props.location.address,
        gtfsId: this.props.location.gtfsId,
        gid: this.props.location.gid,
        lat: this.props.location.lat,
        lon: this.props.location.lon,
        layer: this.props.location.layer,
      };
      if (
        (isStop(this.props.location) || isTerminal(this.props.location)) &&
        this.props.location.gtfsId
      ) {
        const type = isTerminal(this.props.location) ? 'station' : 'stop';
        this.props.addFavourite({
          ...favourite,
          type,
          selectedIconId: this.state.selectedIconId,
        });
      } else {
        this.props.addFavourite({
          ...favourite,
          type: 'place',
          selectedIconId: this.state.selectedIconId,
        });
      }
      if (this.props.addAnalyticsEvent) {
        this.props.addAnalyticsEvent({
          category: 'Favourite',
          action: 'SaveFavourite',
          name: this.state.selectedIconId,
        });
      }
      this.props.handleClose();
    }
  };

  render = () => {
    const { name, selectedIconId } = this.state;
    return (
      <Modal>
        {!this.props.isMobile && (
          <DesktopModal
            headerText={i18next.t('save-place')}
            closeArialLabel={i18next.t('close-favourite-modal')}
            autosuggestComponent={this.props.autosuggestComponent}
            closeModal={this.props.handleClose}
            inputPlaceholder={i18next.t('input-placeholder')}
            specifyName={this.specifyName}
            name={name || ''}
            chooseIconText={i18next.t('choose-icon')}
            favouriteIconTable={
              <FavouriteIconTable
                selectedIconId={(() => {
                  if (selectedIconId !== undefined || null) {
                    return selectedIconId;
                  }
                  return undefined;
                })()}
                favouriteIconIds={FavouriteModal.favouriteIconIds}
                handleClick={this.selectIcon}
              />
            }
            saveFavourite={this.save}
            saveText={i18next.t('save')}
            canSave={this.canSave}
          />
        )}
        {this.props.isMobile && (
          <MobileModal
            headerText={i18next.t('save-place')}
            closeArialLabel={i18next.t('close-favourite-modal')}
            autosuggestComponent={this.props.autosuggestComponent}
            closeModal={this.props.handleClose}
            inputPlaceholder={i18next.t('input-placeholder')}
            specifyName={this.specifyName}
            name={name || ''}
            chooseIconText={i18next.t('choose-icon')}
            favouriteIconTable={
              <FavouriteIconTable
                selectedIconId={(() => {
                  if (selectedIconId !== undefined || null) {
                    return selectedIconId;
                  }
                  return undefined;
                })()}
                favouriteIconIds={FavouriteModal.favouriteIconIds}
                handleClick={this.selectIcon}
              />
            }
            saveFavourite={this.save}
            saveText={i18next.t('save')}
            canSave={this.canSave}
          />
        )}
      </Modal>
    );
  };
}

export default FavouriteModal;

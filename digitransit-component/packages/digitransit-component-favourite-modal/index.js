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

i18next.init({ lng: 'fi', resources: {} });

i18next.addResourceBundle('en', 'translation', translations.en);
i18next.addResourceBundle('fi', 'translation', translations.fi);
i18next.addResourceBundle('sv', 'translation', translations.sv);

const isStop = ({ layer }) => layer === 'stop' || layer === 'favouriteStop';

const isTerminal = ({ layer }) =>
  layer === 'station' || layer === 'favouriteStation';

const Modal = ({ show, children }) => {
  return (
    <div
      className={cx(
        styles.favouriteModal,
        show ? styles['display-block'] : styles['display-none'],
      )}
    >
      <section className={styles.modalMain}>{children}</section>
    </div>
  );
};

Modal.propTypes = {
  show: PropTypes.bool.isRequired,
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

class FavouriteModal extends React.Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    addFavourite: PropTypes.func.isRequired,
    autosuggestComponent: PropTypes.node,
    location: PropTypes.shape({
      address: PropTypes.string,
      gtfsId: PropTypes.string,
      id: PropTypes.string,
      lat: PropTypes.number,
      lon: PropTypes.number,
      layer: PropTypes.string,
      defaultName: PropTypes.string,
    }),
    prefilledFavourite: PropTypes.shape({
      name: PropTypes.string,
      selectedIconId: PropTypes.string,
    }),
    addAnalyticsEvent: PropTypes.func,
    lang: PropTypes.string,
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
      name: '',
      selectedIconId: null,
    };
  }

  componentDidMount = () => {
    i18next.changeLanguage(this.props.lang);
  };

  static getDerivedStateFromProps = (nextProps, prevState) => {
    if (
      nextProps.prefilledFavourite.name !== prevState.name ||
      nextProps.prefilledFavourite.selectedIconId !== prevState.selectedIconId
    ) {
      return {
        name: nextProps.prefilledFavourite.name || '',
        selectedIconId: nextProps.prefilledFavourite.selectedIconId || null,
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
        gid: this.props.location.id,
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
      <Modal show={this.props.show}>
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
              aria-label={i18next.t('close-favourite-modal')}
            >
              <Icon img="close" width={1} height={1} color="#007ac9" />
            </div>
          </div>
          <div className={styles['favourite-modal-main']}>
            <div className={styles['favourite-modal-location-search']}>
              {this.props.autosuggestComponent}
            </div>
            <div className={styles['favourite-modal-name']}>
              <input
                className={styles['favourite-modal-input']}
                value={name || ''}
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
                if (selectedIconId !== undefined || null) {
                  return selectedIconId;
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

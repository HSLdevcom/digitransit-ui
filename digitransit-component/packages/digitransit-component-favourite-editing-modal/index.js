/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import i18next from 'i18next';
import escapeRegExp from 'lodash/escapeRegExp';
import uniqueId from 'lodash/uniqueId';
import Icon from '@digitransit-component/digitransit-component-icon';
import DesktopModal from './helpers/DesktopModal';
import MobileModal from './helpers/MobileModal';
import styles from './helpers/styles.scss';
import translations from './helpers/translations';

i18next.init({ lng: 'fi', resources: {} });

i18next.addResourceBundle('en', 'translation', translations.en);
i18next.addResourceBundle('fi', 'translation', translations.fi);
i18next.addResourceBundle('sv', 'translation', translations.sv);

const Modal = ({ children }) => {
  return (
    <div className={styles['favourite-edit-modal']}>
      <section className={styles['favourite-edit-modal-main']}>
        {children}
      </section>
    </div>
  );
};

Modal.propTypes = {
  children: PropTypes.node,
};

class FavouriteEditingModal extends React.Component {
  static propTypes = {
    /** Required. Close modal.
     * @type {function} */
    handleClose: PropTypes.func.isRequired,
    /** Required.
     * @type {function} */
    updateFavourites: PropTypes.func.isRequired,
    /** Required.
     * @type {array<object>}
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
     */
    favourites: PropTypes.arrayOf(
      PropTypes.shape({
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
      }),
    ).isRequired,
  };

  constructor(props) {
    super(props);
    this.draggableFavourites = [];
    this.state = {
      isDraggingOverIndex: undefined,
      favourites: props.favourites,
    };
  }

  handleOnFavouriteDragOver = (event, index) => {
    event.preventDefault();
    this.setState({ isDraggingOverIndex: index });
  };

  handleOnFavouriteDragEnd = () => {
    this.setState({
      isDraggingOverIndex: undefined,
    });
  };

  handleOnFavouriteDrop = (event, targetIndex) => {
    event.preventDefault();
    const draggedIndex = Number.parseInt(
      event.dataTransfer.getData('text'),
      10,
    );
    if (
      Number.isNaN(draggedIndex) ||
      draggedIndex === targetIndex ||
      targetIndex - draggedIndex === 1
    ) {
      return;
    }
    const { favourites } = this.state;
    const draggedFavourite = favourites.splice(draggedIndex, 1)[0];
    favourites.splice(
      targetIndex > draggedIndex ? targetIndex - 1 : targetIndex,
      0,
      draggedFavourite,
    );
    this.setState({ favourites, isDraggingOverIndex: undefined }, () =>
      this.props.updateFavourites(favourites),
    );
  };

  setDraggableFavouriteRef = (element, index) => {
    this.draggableFavourites[index] = element;
  };

  handleStartFavouriteDragging = (event, isDraggingIndex) => {
    // IE and Edge < 18 do not support setDragImage
    if (
      event.dataTransfer.setDragImage &&
      this.draggableFavourites[isDraggingIndex]
    ) {
      event.dataTransfer.setDragImage(
        this.draggableFavourites[isDraggingIndex],
        0,
        0,
      );
    }

    // IE throws an error if trying to set the dropEffect
    event.dataTransfer.dropEffect = 'move'; // eslint-disable-line no-param-reassign
    event.dataTransfer.effectAllowed = 'move'; // eslint-disable-line no-param-reassign

    // IE and Edge only support the type 'text'
    event.dataTransfer.setData('text', `${isDraggingIndex}`);
  };

  renderFavouriteListItem = (favourite, index) => {
    const iconId = favourite.selectedIconId.replace('icon-icon_', '');
    const address = favourite.address.replace(
      new RegExp(`${escapeRegExp(favourite.name)}(,)?( )?`),
      '',
    );
    return (
      <li
        className={cx(styles['favourite-edit-list-item'], {
          [styles['drop-target-before']]:
            index === this.state.isDraggingOverIndex,
        })}
        key={uniqueId(`favourite-edit-list-item-${index}`)}
        onDragOver={e => this.handleOnFavouriteDragOver(e, index)}
        onDrop={e => this.handleOnFavouriteDrop(e, index)}
        ref={el => this.setDraggableFavouriteRef(el, index)}
      >
        <div className={styles['favourite-edit-list-item-left']}>
          <div
            className={styles['favourite-edit-list-item-drag']}
            draggable
            onDragEnd={this.handleOnFavouriteDragEnd}
            onDragStart={e => this.handleStartFavouriteDragging(e, index)}
          >
            <div className={styles['favourite-edit-list-item-ellipsis']}>
              <Icon img="ellipsis" />
            </div>
          </div>
          <div
            className={cx(
              styles['favourite-edit-list-item-icon'],
              styles[iconId],
            )}
          >
            <Icon img={iconId} />
          </div>
        </div>
        <div className={styles['favourite-edit-list-item-content']}>
          <p className={styles['favourite-edit-list-item-name']}>
            {favourite.name}
          </p>
          <p className={styles['favourite-edit-list-item-address']}>
            {address}
          </p>
        </div>
        <div className={styles['favourite-edit-list-item-right']}>
          <div className={styles['favourite-edit-list-item-edit']}>
            <Icon img="edit" />
          </div>
          <div className={styles['favourite-edit-list-item-remove']}>
            <Icon img="trash" />
          </div>
        </div>
      </li>
    );
  };

  renderFavouriteList = favourites => {
    return (
      <div className={styles['favourite-edit-list-container']}>
        <ul className={styles['favourite-edit-list']}>
          {favourites.map((favourite, index) =>
            this.renderFavouriteListItem(favourite, index),
          )}
        </ul>
      </div>
    );
  };

  render() {
    const isMobile =
      window && window.innerWidth ? window.innerWidth < 768 : false;
    const { favourites } = this.state;
    return (
      <Modal>
        {isMobile && (
          <MobileModal
            headerText={i18next.t('edit-places')}
            closeModal={this.props.handleClose}
            closeArialLabel={i18next.t('close-modal')}
            renderList={this.renderFavouriteList(favourites)}
          />
        )}
        {!isMobile && (
          <DesktopModal
            headerText={i18next.t('edit-places')}
            closeModal={this.props.handleClose}
            closeArialLabel={i18next.t('close-modal')}
            renderList={this.renderFavouriteList(favourites)}
          />
        )}
      </Modal>
    );
  }
}

export default FavouriteEditingModal;

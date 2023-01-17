/* eslint react/forbid-prop-types: 0 */
import PropTypes from 'prop-types';
import React from 'react';
import { ReactSortable } from 'react-sortablejs';
import cx from 'classnames';
import i18next from 'i18next';
import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import ContainerSpinner from '@hsl-fi/container-spinner';
import Modal from '@hsl-fi/modal';
import Icon from '@digitransit-component/digitransit-component-icon';
import DialogModal from '@digitransit-component/digitransit-component-dialog-modal';
import { formatFavouritePlaceLabel } from '@digitransit-search-util/digitransit-search-util-uniq-by-label';
import ModalContent from './helpers/ModalContent';
import styles from './helpers/styles.scss';
import translations from './helpers/translations';

i18next.init({
  lng: 'fi',
  fallbackLng: 'fi',
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
});

const isKeyboardSelectionEvent = event => {
  const space = [13, ' ', 'Spacebar'];
  const enter = [32, 'Enter'];
  const key = (event && (event.key || event.which || event.keyCode)) || '';

  if (!key || !space.concat(enter).includes(key)) {
    return false;
  }
  event.preventDefault();
  return true;
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
     * @type {function} */
    deleteFavourite: PropTypes.func.isRequired,
    /** Required. Function that takes selected favourite object as parameter.
     * @type {function} */
    onEditSelected: PropTypes.func.isRequired,
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
    lang: PropTypes.string,
    appElement: PropTypes.string.isRequired,
    isModalOpen: PropTypes.bool.isRequired,
    isMobile: PropTypes.bool,
    isLoading: PropTypes.bool.isRequired,
    color: PropTypes.string,
    hoverColor: PropTypes.string,
    /** Optional. */
    fontWeights: PropTypes.shape({
      /** Default value is 500. */
      medium: PropTypes.number,
    }),
  };

  static defaultProps = {
    lang: 'fi',
    isMobile: false,
    color: '#007ac9',
    hoverColor: '#0062a1',
    fontWeights: {
      medium: 500,
    },
  };

  constructor(props) {
    super(props);
    i18next.changeLanguage(props.lang);
    this.draggableFavourites = [];
    this.state = {
      favourites: props.favourites,
      showDeletePlaceModal: false,
      selectedFavourite: null,
    };
    Object.keys(translations).forEach(lang => {
      i18next.addResourceBundle(lang, 'translation', translations[lang]);
    });
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    const nextFavourites = nextProps.favourites;
    const prevFavourites = prevState.favourites;
    if (
      !isEmpty(differenceWith(nextFavourites, prevFavourites, isEqual)) ||
      !isEmpty(differenceWith(prevFavourites, nextFavourites, isEqual))
    ) {
      if (isEmpty(nextFavourites)) {
        nextProps.handleClose();
      }
      return {
        favourites: nextFavourites,
      };
    }
    return null;
  };

  componentDidUpdate = () => {
    if (i18next.language !== this.props.lang) {
      i18next.changeLanguage(this.props.lang);
    }
  };

  moveFavourite = (i, direction) => {
    const { favourites } = this.state;
    // Edit copy of the favourites to avoid changing the props.favourites used for state initialization
    const favouritesCopy = [...favourites];

    const tmp = favouritesCopy[i + direction];
    favouritesCopy[i + direction] = favouritesCopy[i];
    favouritesCopy[i] = tmp;

    this.setState({ favourites: favouritesCopy });
  };

  renderFavouriteListItem = (favourite, index) => {
    const iconId = favourite.selectedIconId
      ? favourite.selectedIconId.replace('icon-icon_', '')
      : 'place';
    const [name, address] = formatFavouritePlaceLabel(
      favourite.name,
      favourite.address,
    );

    return (
      <li
        className={cx(styles['favourite-edit-list-item'])}
        key={favourite.favouriteId}
      >
        <div className={styles['favourite-edit-list-item-left']}>
          {index > 0 && (
            <button
              className={styles['favourite-edit-list-arrow-hidden']}
              styles={{ color: this.props.color }}
              type="button"
              aria-label={i18next.t('up')}
              onClick={() => {
                this.moveFavourite(index, -1);
              }}
            >
              &uarr;
            </button>
          )}
          {index < this.state.favourites.length - 1 && (
            <button
              className={styles['favourite-edit-list-arrow-hidden']}
              styles={{ color: this.props.color }}
              type="button"
              aria-label={i18next.t('down')}
              onClick={() => {
                this.moveFavourite(index, 1);
              }}
            >
              &darr;
            </button>
          )}
          <div className={styles['favourite-edit-list-item-drag']}>
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
            <Icon img={iconId} color={this.props.color} />
          </div>
        </div>
        <div className={styles['favourite-edit-list-item-content']}>
          <p className={styles['favourite-edit-list-item-name']}>{name}</p>
          <p className={styles['favourite-edit-list-item-address']}>
            {address}
          </p>
        </div>
        <div className={styles['favourite-edit-list-item-right']}>
          <div
            role="button"
            tabIndex="0"
            aria-label={i18next.t('edit-place-name', {
              favourite,
            })}
            className={styles['favourite-edit-list-item-edit']}
            onClick={() => this.props.onEditSelected(favourite)}
            onKeyDown={e => {
              if (isKeyboardSelectionEvent(e)) {
                this.props.onEditSelected(favourite);
              }
            }}
          >
            <Icon img="edit" />
          </div>
          <div
            role="button"
            tabIndex="0"
            aria-label={i18next.t('delete-place-name', {
              favourite,
            })}
            className={styles['favourite-edit-list-item-remove']}
            onClick={() =>
              this.setState({
                selectedFavourite: favourite,
                showDeletePlaceModal: true,
              })
            }
            onKeyDown={e => {
              if (isKeyboardSelectionEvent(e)) {
                this.setState({
                  selectedFavourite: favourite,
                  showDeletePlaceModal: true,
                });
              }
            }}
          >
            <Icon img="trash" />
          </div>
        </div>
      </li>
    );
  };

  renderFavouriteList = () => {
    const { isLoading } = this.props;
    const { favourites } = this.state;
    return (
      <div className={styles['favourite-edit-list-container']}>
        <ContainerSpinner visible={isLoading}>
          <ReactSortable
            className={styles['favourite-edit-list']}
            tag="ul"
            list={favourites}
            setList={items => this.setState({ favourites: items })}
            animation={200}
            handle={`.${styles['favourite-edit-list-item-left']}`}
          >
            {favourites.map((favourite, index) => {
              return this.renderFavouriteListItem(favourite, index);
            })}
          </ReactSortable>
        </ContainerSpinner>
      </div>
    );
  };

  renderDeleteFavouriteModal = favourite => {
    return (
      <DialogModal
        appElement={this.props.appElement}
        headerText={i18next.t('delete-place-header')}
        handleClose={() =>
          this.setState(
            { selectedFavourite: null, showDeletePlaceModal: false },
            () => this.props.handleClose(),
          )
        }
        isModalOpen={this.state.showDeletePlaceModal}
        dialogContent={
          favourite ? `${favourite.name}: ${favourite.address}` : ''
        }
        primaryButtonText={i18next.t('delete')}
        primaryButtonOnClick={() => {
          this.props.deleteFavourite(favourite);
          this.setState({
            selectedFavourite: null,
            showDeletePlaceModal: false,
          });
        }}
        secondaryButtonText={i18next.t('cancel')}
        secondaryButtonOnClick={() =>
          this.setState({
            selectedFavourite: null,
            showDeletePlaceModal: false,
          })
        }
        color={this.props.color}
        hoverColor={this.props.hoverColor}
        fontWeights={this.props.fontWeights}
        lang={this.props.lang}
      />
    );
  };

  closeModal = () => {
    this.props.handleClose();
    const omittedFavourites = this.state.favourites.map(item =>
      omit(item, ['chosen', 'selected']),
    );
    if (!isEqual(omittedFavourites, this.props.favourites)) {
      this.props.updateFavourites(omittedFavourites);
    }
  };

  renderModalContent = () => {
    const { color, hoverColor, fontWeights } = this.props;
    const modalProps = {
      headerText: i18next.t('edit-places'),
      renderList: () => this.renderFavouriteList(),
    };
    return (
      <div
        style={{
          '--color': `${color}`,
          '--hover-color': `${hoverColor}`,
          '--font-weight-medium': fontWeights.medium,
        }}
      >
        <ModalContent {...modalProps} />
      </div>
    );
  };

  render() {
    const { isMobile } = this.props;
    const { showDeletePlaceModal, selectedFavourite } = this.state;
    return (
      <div>
        {isMobile && (
          <Modal
            appElement={this.props.appElement}
            contentLabel={i18next.t('edit-modal-on-open')}
            closeButtonLabel={i18next.t('close-modal')}
            variant="large"
            isOpen={this.props.isModalOpen}
            onCrossClick={this.closeModal}
          >
            {this.renderDeleteFavouriteModal(selectedFavourite)}
            {this.renderModalContent()}
          </Modal>
        )}
        {!isMobile && (
          <Modal
            appElement={this.props.appElement}
            contentLabel={i18next.t('edit-modal-on-open')}
            closeButtonLabel={i18next.t('close-modal')}
            variant="small"
            isOpen={this.props.isModalOpen}
            onCrossClick={this.closeModal}
          >
            {this.renderDeleteFavouriteModal(selectedFavourite)}
            {!showDeletePlaceModal && this.renderModalContent()}
          </Modal>
        )}
      </div>
    );
  }
}

export default FavouriteEditingModal;

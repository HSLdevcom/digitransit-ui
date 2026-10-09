import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReactSortable } from 'react-sortablejs';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import { Spinner } from '@hsl-fi/loading-indicators';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import DialogModal from '@digitransit-component/digitransit-component-dialog-modal';
import FavouriteListItem, {
  DRAG_HANDLE_CLASS,
} from './helpers/FavouriteListItem';
import i18n from './helpers/i18n';
import styles from './helpers/styles.scss';

/**
 * A dialog for reordering, editing and deleting favourite places, built on
 * the HSL design system's Modal. Colors, typography and the mobile/desktop
 * layout are handled by the design system, so the dialog follows the active
 * deployment's theme.
 *
 * @example
 * <FavouriteEditingModal
 *   isModalOpen={modalOpen}
 *   handleClose={handleClose}
 *   favourites={favourites}
 *   updateFavourites={onUpdateFavourites}
 *   deleteFavourite={onDeleteFavourite}
 *   onEditSelected={onEditSelected}
 *   isLoading={false}
 *   lang="fi"
 * />
 */
function FavouriteEditingModal({
  isModalOpen,
  handleClose,
  updateFavourites,
  deleteFavourite,
  onEditSelected,
  favourites,
  isLoading,
  lang = 'fi',
}) {
  const { t } = useTranslation('translation', { i18n });
  const [source, setSource] = useState(favourites);
  const [reordered, setReordered] = useState(null);
  const [selectedFavourite, setSelectedFavourite] = useState(null);
  const previousFavourites = useRef(favourites);

  // Drop the local order when the favourites change from outside
  if (!isEqual(source, favourites)) {
    setSource(favourites);
    setReordered(null);
  }
  const items = reordered || favourites;

  useEffect(() => {
    if (
      previousFavourites.current !== favourites &&
      !isEqual(previousFavourites.current, favourites) &&
      isEmpty(favourites)
    ) {
      handleClose();
    }
    previousFavourites.current = favourites;
  }, [favourites, handleClose]);

  const move = (index, direction) => {
    const copy = [...items];
    [copy[index], copy[index + direction]] = [
      copy[index + direction],
      copy[index],
    ];
    setReordered(copy);
  };

  const closeModal = () => {
    handleClose();
    const omitted = items.map(item => omit(item, ['chosen', 'selected']));
    if (!isEqual(omitted, favourites)) {
      updateFavourites(omitted);
    }
  };

  const closeDeleteDialog = () => setSelectedFavourite(null);

  return (
    <>
      <DialogModal
        headerText={t('delete-place-header', { lng: lang })}
        handleClose={() => {
          closeDeleteDialog();
          handleClose();
        }}
        isModalOpen={selectedFavourite !== null}
        dialogContent={
          selectedFavourite
            ? `${selectedFavourite.name}: ${selectedFavourite.address}`
            : ''
        }
        primaryButtonText={t('delete', { lng: lang })}
        primaryButtonOnClick={() => {
          deleteFavourite(selectedFavourite);
          closeDeleteDialog();
        }}
        secondaryButtonText={t('cancel', { lng: lang })}
        secondaryButtonOnClick={closeDeleteDialog}
        lang={lang}
      />
      <Modal
        open={isModalOpen && selectedFavourite === null}
        onOpenChange={open => {
          if (!open) {
            closeModal();
          }
        }}
      >
        <ModalContent
          lang={lang}
          title={t('edit-places', { lng: lang })}
          className={styles.modalContent}
          aria-describedby={undefined}
        >
          <div className={styles.listContainer}>
            <ReactSortable
              className={styles.list}
              tag="ul"
              list={items}
              setList={setReordered}
              animation={200}
              handle={`.${DRAG_HANDLE_CLASS}`}
            >
              {items.map((favourite, index) => (
                <FavouriteListItem
                  key={favourite.favouriteId}
                  favourite={favourite}
                  lang={lang}
                  onMoveUp={index > 0 ? () => move(index, -1) : null}
                  onMoveDown={
                    index < items.length - 1 ? () => move(index, 1) : null
                  }
                  onEdit={() => onEditSelected(favourite)}
                  onDelete={() => setSelectedFavourite(favourite)}
                />
              ))}
            </ReactSortable>
            {isLoading && (
              <div className={styles.overlay}>
                <Spinner />
              </div>
            )}
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}

FavouriteEditingModal.propTypes = {
  /** Required. Whether the dialog is open.
   * @type {boolean} */
  isModalOpen: PropTypes.bool.isRequired,
  /** Required. Close modal.
   * @type {function} */
  handleClose: PropTypes.func.isRequired,
  /** Required. Called with the reordered favourites when the dialog is closed.
   * @type {function} */
  updateFavourites: PropTypes.func.isRequired,
  /** Required. Called with the favourite the user confirmed deleting.
   * @type {function} */
  deleteFavourite: PropTypes.func.isRequired,
  /** Required. Function that takes selected favourite object as parameter.
   * @type {function} */
  onEditSelected: PropTypes.func.isRequired,
  /** Required. Whether a save is in progress; shows a spinner over the list.
   * @type {boolean} */
  isLoading: PropTypes.bool.isRequired,
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
  /** Optional. Language, fi, en or sv. Defaults to fi.
   * @type {string} */
  lang: PropTypes.string,
};

export default FavouriteEditingModal;

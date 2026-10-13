import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import i18n from './helpers/i18n';
import FavouriteForm from './helpers/FavouriteForm';
import styles from './helpers/styles.scss';

const noop = () => {};

/**
 * A dialog for adding a new favourite place or editing an existing one,
 * built on the HSL design system's Modal. Colors, typography and the
 * mobile/desktop layout are handled by the design system, so the dialog
 * follows the active deployment's theme.
 *
 * @example
 * <FavouriteModal
 *   isModalOpen={modalOpen}
 *   handleClose={handleClose}
 *   saveFavourite={onSaveFavourite}
 *   favourite={favourite}
 *   lang={lang}
 *   autosuggestComponent={
 *     <AutoSuggest
 *       sources={['History', 'Datasource']}
 *       targets={['Locations', 'CurrentPosition']}
 *       id="favourite"
 *       autoFocus={false}
 *       placeholder="search-address-or-place"
 *       value={favourite.address || ''}
 *       selectHandler={setLocationProperties}
 *       lang={lang}
 *     />
 *   }
 * />
 */
function FavouriteModal({
  isModalOpen,
  handleClose,
  saveFavourite,
  cancelSelected = noop,
  autosuggestComponent,
  favourite = null,
  lang = 'fi',
}) {
  const { t } = useTranslation('translation', { i18n });
  const isEdit = favourite?.favouriteId !== undefined;

  return (
    <Modal
      open={isModalOpen}
      onOpenChange={open => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <ModalContent
        lang={lang}
        title={t(isEdit ? 'edit-place' : 'save-place', { lng: lang })}
        className={styles.modalContent}
        aria-describedby={undefined}
      >
        <FavouriteForm
          favourite={favourite}
          isEdit={isEdit}
          lang={lang}
          autosuggestComponent={autosuggestComponent}
          saveFavourite={saveFavourite}
          cancelSelected={cancelSelected}
          handleClose={handleClose}
        />
      </ModalContent>
    </Modal>
  );
}

FavouriteModal.propTypes = {
  /** Required. Whether the dialog is open.
   * @type {boolean} */
  isModalOpen: PropTypes.bool.isRequired,
  /** Required. Called when the dialog is closed without saving.
   * @type {function} */
  handleClose: PropTypes.func.isRequired,
  /** Required. Called with the favourite when the user saves it.
   * @type {function} */
  saveFavourite: PropTypes.func.isRequired,
  /** Optional, but needed when editing (favourite has a favouriteId): called
   * after saving and when the user presses Cancel, typically to return to the
   * favourites list. Not used when adding a new favourite.
   * @type {function} */
  cancelSelected: PropTypes.func,
  /** Autosuggest component for searching the location of the favourite.
   * @type {node} */
  autosuggestComponent: PropTypes.node.isRequired,
  /** Optional. Object to prefill the dialog. Having a favouriteId puts the
   * dialog in edit mode.
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
  /** Optional. Language, fi, en or sv. Defaults to fi.
   * @type {string} */
  lang: PropTypes.string,
};

export default FavouriteModal;

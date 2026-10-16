import React, { useEffect, useRef } from 'react';
import Modal from '@hsl-fi/modal';
import { CloseButton } from '@hsl-fi/layout-primitives';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Filters from './Filters';
import { useFilterContext } from './FiltersContext';

const FiltersModal = ({ isOpen, onClose }) => {
  const { resetFilters, selectedFilters } = useFilterContext();
  const intl = useIntl();
  const filtersOnOpenRef = useRef(selectedFilters);

  useEffect(() => {
    if (isOpen) {
      filtersOnOpenRef.current = selectedFilters;
    }
    // Only capture the filters that were active when the modal opened;
    // re-running this while it's open (as the user toggles filters) would
    // make every close look like a no-op change. selectedFilters is
    // intentionally omitted from the deps for this reason.
  }, [isOpen]);

  const handleClose = () => {
    if (filtersOnOpenRef.current !== selectedFilters) {
      // On mobile, this modal locks page scrolling while open by giving
      // document.body `position: fixed` with a negative `top` equal to the
      // scroll position at open time, then restores that same position by
      // reading `body.style.top` back once its close animation finishes.
      // Since the filters (and therefore the results) changed while open,
      // we don't want the old position restored. Zeroing this value here,
      // synchronously before the close animation/timers even start, makes
      // the library's own restore see "nothing to restore" and leave the
      // page at the top - avoiding both the old position and any visible
      // jump/flicker a delayed correction after the fact would cause.
      document.body.style.top = '0px';
    }
    onClose();
  };

  return (
    <Modal
      appElement="#app"
      isOpen={isOpen}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      contentLabel={intl.formatMessage({
        id: 'filters',
        defaultMessage: 'Filters',
      })}
      onRequestClose={handleClose}
      variant="large"
      className="traffic-now traffic-now__modal design-system"
    >
      <header className="traffic-now__modal-header bordered">
        <FormattedMessage id="filter" defaultMessage="Filter">
          {msg => (
            <h3 className="heading-xs traffic-now__modal-header__label">
              {msg}
            </h3>
          )}
        </FormattedMessage>
        <CloseButton lang={intl.locale} onClick={handleClose} />
      </header>
      <Filters onApplyClick={handleClose} onResetClick={resetFilters} />
    </Modal>
  );
};

FiltersModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FiltersModal;

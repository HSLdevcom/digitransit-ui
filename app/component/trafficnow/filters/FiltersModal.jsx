import React from 'react';
import Modal from '@hsl-fi/modal';
import { CloseButton } from '@hsl-fi/layout-primitives';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import Filters from './Filters';
import { useFilterContext } from './FiltersContext';

const FiltersModal = ({ isOpen, onClose }) => {
  const { resetFilters } = useFilterContext();
  const intl = useIntl();

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
      onRequestClose={onClose}
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
        <CloseButton lang={intl.locale} onClick={onClose} />
      </header>
      <Filters onApplyClick={onClose} onResetClick={resetFilters} />
    </Modal>
  );
};

FiltersModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FiltersModal;

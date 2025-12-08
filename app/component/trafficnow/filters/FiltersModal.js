import React from 'react';
import Modal from '@hsl-fi/modal';
import PropTypes from 'prop-types';
import Filters from './Filters';
import Icon from '../../Icon';
import IconBackground from '../../icon/IconBackground';
import { useFilterContext } from './FiltersContext';

const FiltersModal = ({ isOpen, onClose }) => {
  const { resetFilters } = useFilterContext();

  return (
    <Modal
      appElement="#app"
      isOpen={isOpen}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      contentLabel="Filters"
      onRequestClose={onClose}
      variant="large"
      className="traffic-now__modal-filters"
    >
      <header>
        <h3>Suodata</h3>
        <button type="button" onClick={onClose}>
          <Icon
            height={1.5}
            width={1.5}
            iconScale={0.4}
            img="icon_close"
            color="#007ac9"
            background={<IconBackground shape="circle" color="#ebf6fd" />}
          />
        </button>
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

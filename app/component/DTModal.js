import React from 'react';
import PropTypes from 'prop-types';

const DTModal = ({ show, children, windowed, dtModalOnClick }) => {
  const showClassname = show
    ? `dtmodal display-block ${windowed ? 'windowed' : ''}`
    : 'modal display-none';

  const handleModalOnClick = e => {
    if (
      (dtModalOnClick && e.target.className === 'from-map-modal-container') ||
      e.keyCode === 27
    ) {
      dtModalOnClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex="0"
      className="from-map-modal-container"
      onClick={handleModalOnClick}
      onKeyDown={handleModalOnClick}
    >
      <div className={showClassname}>
        <section className="modal-main from-map-modal">{children}</section>
      </div>
    </div>
  );
};

DTModal.propTypes = {
  show: PropTypes.bool.isRequired,
  children: PropTypes.node,
  windowed: PropTypes.bool,
  dtModalOnClick: PropTypes.func,
};

DTModal.defaultProps = {
  children: [],
  windowed: false,
};

export default DTModal;

import React from 'react';
import PropTypes from 'prop-types';

const DTModal = ({ show, children, windowed, onClick, onKeyDown }) => {
  const showClassname = show
    ? `dtmodal display-block ${windowed ? 'windowed' : ''}`
    : 'modal display-none';

  return (
    <div
      role="button"
      tabIndex="0"
      className="from-map-modal-container"
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <div className={showClassname}>
        <section className="modal-main">{children}</section>
      </div>
    </div>
  );
};

DTModal.propTypes = {
  show: PropTypes.bool.isRequired,
  children: PropTypes.node,
  windowed: PropTypes.bool,
  onClick: PropTypes.func,
  onKeyDown: PropTypes.func,
};

DTModal.defaultProps = {
  children: [],
  windowed: false,
};

export default DTModal;

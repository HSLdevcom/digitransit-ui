import React from 'react';
import PropTypes from 'prop-types';

const DTModal = ({ show, children }) => {
  const showClassname = show ? 'dtmodal display-block' : 'modal display-none';

  return (
    <div className={showClassname}>
      <section className="modal-main">{children}</section>
    </div>
  );
};

DTModal.propTypes = {
  show: PropTypes.bool.isRequired,
  children: PropTypes.node,
};

DTModal.defaultProps = {
  children: [],
};

export default DTModal;

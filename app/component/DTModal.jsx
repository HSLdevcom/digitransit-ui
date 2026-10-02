import React from 'react';
import PropTypes from 'prop-types';

const EMPTY_CHILDREN = [];

const DTModal = ({ show, children = EMPTY_CHILDREN }) => {
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

export default DTModal;

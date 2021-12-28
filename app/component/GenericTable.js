import PropTypes from 'prop-types';
import React from 'react';

function GenericTable(props) {
  return (
    <div className="generic-table">
      <div className="row">{props.children}</div>
    </div>
  );
}

GenericTable.displayName = 'GenericTable';

GenericTable.propTypes = {
  children: PropTypes.node,
};

export default GenericTable;

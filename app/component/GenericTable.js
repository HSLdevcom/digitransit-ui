import PropTypes from 'prop-types';
import React from 'react';
import ComponentUsageExample from './ComponentUsageExample';

function GenericTable(props) {
  return (
    <div className="generic-table">
      <div className="row">{props.children}</div>
    </div>
  );
}

GenericTable.displayName = 'GenericTable';

GenericTable.description = () => (
  <div>
    <p>Renders a score table</p>
    <ComponentUsageExample description="">
      <GenericTable />
    </ComponentUsageExample>
  </div>
);

GenericTable.propTypes = {
  children: PropTypes.node,
};

export default GenericTable;

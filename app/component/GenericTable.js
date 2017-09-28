import PropTypes from 'prop-types';
import React from 'react';
import ComponentUsageExample from './ComponentUsageExample';

function GenericTable(props) {
  let highEndLabel;
  let lowEndLabel;

  if (props.showLabels) {
    lowEndLabel = <span className="left">{props.lowEndLabel}</span>;

    highEndLabel = <span className="right">{props.highEndLabel}</span>;
  }

  return (
    <div className="generic-table">
      <div className="row">{props.children}</div>
      <div className="generic-table__label-container">
        {lowEndLabel}
        {highEndLabel}
      </div>
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
  showLabels: PropTypes.bool,
  lowEndLabel: PropTypes.object,
  highEndLabel: PropTypes.object,
  children: PropTypes.node,
};

export default GenericTable;

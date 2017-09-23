import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import ComponentUsageExample from './ComponentUsageExample';

const Labeled = ({ children, onClick, className, label, showLabel }) => (
  <span
    className={cx(onClick ? 'cursor-pointer' : undefined, 'labeled', className)}
    onClick={onClick}
  >
    <div className="labeled-item">{children}</div>
    {showLabel ? <div className="labeled-label">{label}</div> : undefined}
  </span>
);

Labeled.propTypes = {
  label: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  showLabel: PropTypes.bool,
  className: PropTypes.string,
};

const exampleLabel = <span>Example label</span>;

Labeled.displayName = 'Labeled';

Labeled.description = () => (
  <div>
    <p>This component wraps other components into a labeled component.</p>
    <ComponentUsageExample>
      <Labeled label={exampleLabel} showLabel>
        Example content
      </Labeled>
    </ComponentUsageExample>
  </div>
);

export default Labeled;

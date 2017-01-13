import React from 'react';

import ComponentUsageExample from './ComponentUsageExample';

const Centered = ({ children }) => (
  <div className="centered">
    <div className="centered--item">{children}</div>
  </div>
);

Centered.propTypes = {
  children: React.PropTypes.node.isRequired,
};

Centered.displayName = 'Centered';

Centered.description = () =>
  <div>
    <p>
      This component centers other components using flex.
    </p>
    <ComponentUsageExample description="basic">
      <Centered>Center this</Centered>
    </ComponentUsageExample>
  </div>;


export default Centered;

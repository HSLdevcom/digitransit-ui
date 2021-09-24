import PropTypes from 'prop-types';
import React from 'react';

const SplitBars = ({ children }) => {
  let splits = [];
  children.forEach(child => {
    splits.push(<div className="split-bar">{child}</div>);
    splits.push(<div className="split-bar--bar" />);
  });
  splits = splits.splice(0, splits.length - 1);
  return <div className="split-bars">{splits}</div>;
};

SplitBars.displayName = 'SplitBars';

SplitBars.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SplitBars;

import React from 'react';
import PropTypes from 'prop-types';
/*
*  A wrapper for control components locating in column next (or below) to the map. 
*/

const ControlPanel = ({ className, children }) => (
  <div className={className}>{children}</div>
);

ControlPanel.propTypes = {
  className: PropTypes.string.isRequired,
  children: PropTypes.node,
};
export default ControlPanel;

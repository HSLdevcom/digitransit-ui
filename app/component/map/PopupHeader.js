import PropTypes from 'prop-types';
import React from 'react';

const PopupHeader = ({ header, subHeader, children }) => {
  return (
    <div className="location-popup-wrapper">
      <div className="location-address">{header}</div>
      <div className="location-place">
        {subHeader}
        {children}
      </div>
    </div>
  );
};

PopupHeader.propTypes = {
  header: PropTypes.string,
  subHeader: PropTypes.string,
  children: PropTypes.node,
};

export default PopupHeader;

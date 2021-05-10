import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

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

PopupHeader.contextTypes = {
  intl: intlShape.isRequired,
};

export default PopupHeader;

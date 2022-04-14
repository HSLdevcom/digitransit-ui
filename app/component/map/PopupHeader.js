import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

const PopupHeader = ({ header, subHeader, children }, { intl }) => {
  return (
    <div className="location-popup-wrapper">
      <div className="location-address">{header}</div>
      {(children || subHeader) && (
        <div className="location-place">
          {!subHeader
            ? intl.formatMessage({ id: 'zone', defaultMessage: 'Zone' })
            : subHeader}
          {children}
        </div>
      )}
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

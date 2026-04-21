import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';

const PopupHeader = ({ header, subHeader, children }) => {
  const intl = useIntl();
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

PopupHeader.defaultProps = {
  header: undefined,
  subHeader: undefined,
  children: undefined,
};

export default PopupHeader;

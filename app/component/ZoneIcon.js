import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

/**
 * The default identifier for an unknown zone.
 */
export const ZONE_UNKNOWN = 'Ei HSL';

const ZoneIcon = (
  { className, showTitle, zoneId, zoneIdFontSize, zoneLabelColor },
  { intl },
) => {
  if (!zoneId) {
    return null;
  }
  const zoneUnknown = zoneId === ZONE_UNKNOWN;
  if (showTitle && zoneUnknown) {
    return null;
  }

  const zoneIconStyle = {
    height: '30px',
    width: '30px',
    borderRadius: '50%',
    fontSize: zoneIdFontSize,
    color: '#fff',
    lineHeight: '30px',
    textAlign: 'center',
    background: zoneLabelColor,
    marginLeft: '5px',
  };

  return (
    <div className={cx('zone-icon-container', className)}>
      {showTitle
        ? intl.formatMessage({
            id: 'zone',
            defaultMessage: 'Zone',
          })
        : null}
      {zoneUnknown ? (
        <div className="icon" style={{ textAlign: 'center' }}>
          ?
        </div>
      ) : (
        <div className="circle" style={zoneIconStyle}>
          {zoneId}
        </div>
      )}
    </div>
  );
};

ZoneIcon.propTypes = {
  className: PropTypes.string,
  showTitle: PropTypes.bool,
  zoneId: PropTypes.string,
  zoneIdFontSize: PropTypes.string,
  zoneLabelColor: PropTypes.string,
};

ZoneIcon.defaultProps = {
  className: undefined,
  showTitle: false,
  zoneId: undefined,
  zoneIdFontSize: '20px',
  zoneLabelColor: '#000',
};

ZoneIcon.contextTypes = {
  intl: intlShape.isRequired,
};

export default ZoneIcon;

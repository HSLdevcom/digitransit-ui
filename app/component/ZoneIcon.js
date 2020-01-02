import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

/**
 * The default identifier for an unknown zone.
 */
export const ZONE_UNKNOWN = 'Ei HSL';

const ZoneIcon = (
  {
    className,
    showTitle,
    zoneId,
    zoneIdFontSize,
    zoneLabelColor,
    zoneLabelHeight,
    zoneLabelWidth,
    zoneLabelMarginLeft,
    zoneLabelLineHeight,
  },
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
    height: zoneLabelHeight,
    width: zoneLabelWidth,
    borderRadius: '50%',
    fontSize: zoneIdFontSize,
    color: '#fff',
    lineHeight: zoneLabelLineHeight,
    textAlign: 'center',
    background: zoneLabelColor,
    marginLeft: zoneLabelMarginLeft,
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
  zoneLabelHeight: PropTypes.string,
  zoneLabelWidth: PropTypes.string,
  zoneLabelLineHeight: PropTypes.string,
  zoneLabelMarginLeft: PropTypes.string,
};

ZoneIcon.defaultProps = {
  className: undefined,
  showTitle: false,
  zoneId: undefined,
  zoneIdFontSize: '26px',
  zoneLabelColor: '#000',
  zoneLabelHeight: '30px',
  zoneLabelWidth: '30px',
  zoneLabelLineHeight: '30px',
  zoneLabelMarginLeft: '5px',
};

ZoneIcon.contextTypes = {
  intl: intlShape.isRequired,
};

export default ZoneIcon;

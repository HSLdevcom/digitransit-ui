import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Icon from './Icon';

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
  { intl, config },
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
      {zoneUnknown && (
        <div className="icon" style={{ textAlign: 'center' }}>
          ?
        </div>
      )}
      {!zoneUnknown && config.zoneIconsAsSvg ? (
        <Icon
          img={`icon-icon_zone-${zoneId.toLowerCase()}`}
          className="svg"
          viewBox="0 0 22 22"
        />
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
};

ZoneIcon.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};

export default ZoneIcon;

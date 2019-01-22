import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import Icon from './Icon';

/**
 * The default identifier for an unknown zone.
 */
export const ZONE_UNKNOWN = 'Ei HSL';

const ZoneIcon = ({ className, showTitle, zoneId }, { intl }) => {
  if (!zoneId) {
    return null;
  }
  const zoneUnknown = zoneId === ZONE_UNKNOWN;
  if (showTitle && zoneUnknown) {
    return null;
  }

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
        <Icon
          img={`icon-icon_zone-${zoneId.toLowerCase()}`}
          viewBox="0 0 22 22"
        />
      )}
    </div>
  );
};

ZoneIcon.propTypes = {
  className: PropTypes.string,
  showTitle: PropTypes.bool,
  zoneId: PropTypes.string,
};

ZoneIcon.defaultProps = {
  className: undefined,
  showTitle: false,
  zoneId: undefined,
};

ZoneIcon.contextTypes = {
  intl: intlShape.isRequired,
};

export default ZoneIcon;

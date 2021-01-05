import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

const ZoneIcon = ({ className, showTitle, zoneId }, { intl, config }) => {
  if (!zoneId) {
    return null;
  }

  const zoneUnknown =
    Array.isArray(config.unknownZones) && config.unknownZones.includes(zoneId);
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
      {zoneUnknown && <div className="unknown">?</div>}
      {!zoneUnknown && (
        <div className={cx('circle', { 'multi-letter': zoneId.length > 1 })}>
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

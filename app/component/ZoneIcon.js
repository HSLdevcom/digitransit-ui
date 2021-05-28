import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

const ZoneIcon = ({ className, zoneId, showUnknown }, { config, intl }) => {
  if (!zoneId) {
    return null;
  }

  const zoneUnknown =
    Array.isArray(config.unknownZones) && config.unknownZones.includes(zoneId);

  if (!showUnknown && zoneUnknown) {
    return null;
  }

  return (
    <div
      className={cx(
        'zone-icon-container',
        className,
        {
          'multi-letter-container': !zoneUnknown && zoneId.length > 1,
        },
        {
          'unknown-container': zoneUnknown,
        },
      )}
      aria-label={
        !zoneUnknown
          ? `${intl.formatMessage({ id: 'zone' })} ${zoneId}`
          : intl.formatMessage({ id: 'zone-unknown' })
      }
    >
      {zoneUnknown && (
        <div aria-hidden className="unknown">
          ?
        </div>
      )}
      {!zoneUnknown && (
        <div
          aria-hidden
          className={cx(
            'circle',
            { 'multi-letter': zoneId.length > 1 },
            zoneId,
          )}
        >
          {zoneId}
        </div>
      )}
    </div>
  );
};

ZoneIcon.propTypes = {
  className: PropTypes.string,
  zoneId: PropTypes.string,
  showUnknown: PropTypes.bool,
};

ZoneIcon.defaultProps = {
  className: undefined,
  zoneId: undefined,
  showUnknown: true,
};

ZoneIcon.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};

export default ZoneIcon;

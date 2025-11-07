import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import Icon from './Icon';

function PlatformNumber({ number, short, isRailOrSubway, updated, withText }) {
  if (!number) {
    return false;
  }

  const platformUpdateIcon = (
    <Icon className="platform-updated-icon" img="icon_arrow-right-long" />
  );

  if (short) {
    return (
      <span className="platform-short">
        {withText && (
          <FormattedMessage
            id={isRailOrSubway ? 'track-short-no-num' : 'platform-short-no-num'}
            defaultMessage={isRailOrSubway ? 'Track ' : 'Plat. '}
          />
        )}
        <span
          className={cx('platform-number-wrapper', {
            'platform-updated': updated,
          })}
        >
          {updated && platformUpdateIcon}
          {number}
        </span>
      </span>
    );
  }

  return (
    <span className="platform-number">
      {withText && (
        <FormattedMessage
          id={isRailOrSubway ? 'track' : 'platform'}
          defaultMessage={isRailOrSubway ? 'Track ' : 'Platform '}
        />
      )}
      <span
        className={cx('platform-number-wrapper', {
          'platform-updated': updated,
        })}
      >
        {updated && platformUpdateIcon}
        {number}
      </span>
    </span>
  );
}

PlatformNumber.propTypes = {
  number: PropTypes.string,
  short: PropTypes.bool,
  isRailOrSubway: PropTypes.bool,
  updated: PropTypes.bool,
  withText: PropTypes.bool,
};

PlatformNumber.defaultProps = {
  number: undefined,
  short: true,
  isRailOrSubway: false,
  updated: false,
  withText: true,
};

PlatformNumber.contextTypes = {
  intl: intlShape.isRequired,
};

PlatformNumber.displayName = 'PlatformNumber';

export default PlatformNumber;

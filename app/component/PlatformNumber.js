import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';

function PlatformNumber({ number, short, isRailOrSubway }) {
  if (!number) {
    return false;
  }
  if (short) {
    return (
      <span className="platform-short">
        <FormattedMessage
          id={isRailOrSubway ? 'track-short-no-num' : 'platform-short-no-num'}
          defaultMessage={isRailOrSubway ? 'Track ' : 'Plat. '}
        />
        <span className="platform-number-wrapper">{number}</span>
      </span>
    );
  }

  return (
    <span className="platform-number">
      <FormattedMessage
        id={isRailOrSubway ? 'track' : 'platform'}
        defaultMessage={isRailOrSubway ? 'Track ' : 'Platform '}
      />
      <span className="platform-number-wrapper">{number}</span>
    </span>
  );
}

PlatformNumber.propTypes = {
  number: PropTypes.string,
  short: PropTypes.bool,
  isRailOrSubway: PropTypes.bool,
};

PlatformNumber.defaultProps = {
  number: undefined,
  short: true,
};

PlatformNumber.contextTypes = {
  intl: intlShape.isRequired,
};

PlatformNumber.displayName = 'PlatformNumber';

export default PlatformNumber;

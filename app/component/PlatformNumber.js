import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from './ComponentUsageExample';

function PlatformNumber({ number, short, isRailOrSubway }) {
  if (!number) {
    return false;
  }
  if (short) {
    return (
      <span className="platform-short">
        <FormattedMessage
          id={isRailOrSubway ? 'track-short' : 'platform-short'}
          values={{ platformCode: number }}
          defaultMessage={
            isRailOrSubway ? 'Track {platformCode}' : 'Plat. {platformCode}'
          }
        />
      </span>
    );
  }

  return (
    <span className="platform-number">
      <FormattedMessage
        id={isRailOrSubway ? 'track-num' : 'platform-num'}
        values={{ platformCode: number }}
        defaultMessage={
          isRailOrSubway ? 'Track {platformCode}' : 'Platform {platformCode}'
        }
      />
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

PlatformNumber.displayName = 'PlatformNumber';

PlatformNumber.description = () => (
  <div>
    <p>Displays the platform number for a specific departure</p>
    <ComponentUsageExample>
      <PlatformNumber number="2" />
    </ComponentUsageExample>
  </div>
);

export default PlatformNumber;

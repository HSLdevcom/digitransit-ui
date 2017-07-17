import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from './ComponentUsageExample';

function PlatformNumber({ number, short }) {
  if (!number) {
    return false;
  }

  if (short) {
    return (
      <span className="platform-short">
        <FormattedMessage
          id="platform-short"
          values={{ platformCode: number }}
          defaultMessage="Plat. {platformCode}"
        />
      </span>
    );
  }

  return (
    <span className="platform-number">
      <FormattedMessage
        id="platform-num"
        values={{ platformCode: number }}
        defaultMessage="Platform {platformCode}"
      />
    </span>
  );
}

PlatformNumber.propTypes = {
  number: PropTypes.string,
  short: PropTypes.bool,
};

PlatformNumber.defaultProps = {
  number: false,
  short: true,
};

PlatformNumber.displayName = 'PlatformNumber';

PlatformNumber.description = () =>
  <div>
    <p>
      Displays the platform number for a specific departure
    </p>
    <ComponentUsageExample >
      <PlatformNumber
        number="2"
      />
    </ComponentUsageExample>
  </div>;

export default PlatformNumber;

import React from 'react';
import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from './ComponentUsageExample';

function PlatformNumber({ number, short = true }) {
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
        id="platform-number"
        values={{ platformCode: number }}
        defaultMessage="Platform {platformCode}"
      />
    </span>
  );
}

PlatformNumber.propTypes = {
  number: React.PropTypes.string,
  short: React.PropTypes.number,
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

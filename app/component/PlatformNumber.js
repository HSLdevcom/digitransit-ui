import React from 'react';
import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from './ComponentUsageExample';

function PlatformNumber({ number }) {
  if (!number) {
    return false;
  }
  return (
    <span className="platform-number">
      <FormattedMessage id="platform-short" defaultMessage="Plat." /> {number}
    </span>
  );
}

PlatformNumber.propTypes = {
  number: React.PropTypes.string,
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

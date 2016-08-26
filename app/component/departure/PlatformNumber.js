import React from 'react';
import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

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
  number: React.PropTypes.number,
};

PlatformNumber.description = (
  <div>
    <p>
      Displays the platform number for a specific departure
    </p>
    <ComponentUsageExample >
      <PlatformNumber
        number="2"
      />
    </ComponentUsageExample>
  </div>);

export default PlatformNumber;

import React from 'react';
import { FormattedMessage } from 'react-intl';

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

export default PlatformNumber;

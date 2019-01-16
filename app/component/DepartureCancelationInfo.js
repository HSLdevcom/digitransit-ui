import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import LocalTime from './LocalTime';

const DepartureCancelationInfo = ({
  routeMode,
  shortName,
  headsign,
  scheduledDepartureTime,
}) => {
  if (!routeMode) {
    return null;
  }
  return (
    <FormattedMessage
      id="departure-is-canceled"
      values={{
        departure: (
          <FormattedMessage
            id={`${routeMode.toLowerCase()}-with-route-number`}
            values={{
              routeNumber: shortName,
              headSign: headsign,
            }}
          />
        ),
        time: <LocalTime time={scheduledDepartureTime} />,
      }}
    />
  );
};

DepartureCancelationInfo.propTypes = {
  routeMode: PropTypes.string.isRequired,
  shortName: PropTypes.string.isRequired,
  headsign: PropTypes.string.isRequired,
  scheduledDepartureTime: PropTypes.number.isRequired,
};

export default DepartureCancelationInfo;

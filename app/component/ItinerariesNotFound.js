import React from 'react';
import { FormattedMessage } from 'react-intl';
import NoItinerariesNote from './NoItinerariesNote';
import LocationShape from '../prop-types/LocationShape';

export default function ItinerariesNotFound(props) {
  const { from, to } = props;

  let msg;
  if ((!from.lat || !from.lon) && (!to.lat || !to.lon)) {
    msg = (
      <FormattedMessage
        id="no-route-start-end"
        defaultMessage="Please select origin and destination"
      />
    );
  } else if (!from.lat || !from.lon) {
    msg = (
      <FormattedMessage
        id="no-route-start"
        defaultMessage="Please select origin"
      />
    );
  } else if (!to.lat || !to.lon) {
    msg = (
      <FormattedMessage
        id="no-route-end"
        defaultMessage="Please select destination"
      />
    );
  }
  if (msg) {
    return (
      <div className="summary-list-container">
        <div className="summary-no-route-found">{msg}</div>
      </div>
    );
  }
  return <NoItinerariesNote {...props} />;
}

ItinerariesNotFound.propTypes = {
  from: LocationShape.isRequired,
  to: LocationShape.isRequired,
};

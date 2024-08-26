// import PropTypes from 'prop-types';
import React from 'react';
import { itineraryShape } from '../../util/shapes';

export default function Navigator({
  itinerary /* , focusToPoint, focusToLeg, relayEnvironment */,
}) {
  return <div>Tracking {itinerary.legs.length} legs</div>;
}

Navigator.propTypes = {
  itinerary: itineraryShape.isRequired,
  /*
  focusToPoint: PropTypes.func.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  relayEnvironment: relayShape.isRequired,
  */
};

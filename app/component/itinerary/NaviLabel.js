import React from 'react';
import PropTypes from 'prop-types';
import { itineraryShape, relayShape } from '../../util/shapes';
import Navigator from './Navigator';

function NaviLabel({ itinerary, focusToPoint, focusToLeg, relayEnvironment }) {
  return (
    <div className="navigator-top-label">
      <Navigator
        itinerary={itinerary}
        focusToPoint={focusToPoint}
        focusToLeg={focusToLeg}
        relayEnvironment={relayEnvironment}
      />{' '}
    </div>
  );
}

NaviLabel.propTypes = {
  itinerary: itineraryShape.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  focusToPoint: PropTypes.func.isRequired,
  relayEnvironment: relayShape.isRequired,
};

export default NaviLabel;

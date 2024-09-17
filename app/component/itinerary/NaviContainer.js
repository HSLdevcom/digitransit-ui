import React from 'react';
import PropTypes from 'prop-types';
import { itineraryShape, relayShape } from '../../util/shapes';
import Navigator from './Navigator';

function NaviContainer({
  itinerary,
  focusToPoint,
  focusToLeg,
  relayEnvironment,
}) {
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

NaviContainer.propTypes = {
  itinerary: itineraryShape.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  focusToPoint: PropTypes.func.isRequired,
  relayEnvironment: relayShape.isRequired,
};

export default NaviContainer;

import React from 'react';
import PropTypes from 'prop-types';
import { itineraryShape, relayShape } from '../../util/shapes';
import Navigator from './Navigator';

function NaviLabel({
  itinerary,
  focusToLeg,
  setNavigation,
  focusToPoint,
  relayEnvironment,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 99,
        top: '17px',
        border: '1px solid red',
        width: '100%',
        height: '70px',
        textColor: 'white',
        backgroundColor: '#007ac9',
      }}
    >
      <Navigator
        itinerary={itinerary}
        focusToPoint={focusToPoint}
        focusToLeg={focusToLeg}
        relayEnvironment={relayEnvironment}
        setNavigation={setNavigation}
      />{' '}
    </div>
  );
}

NaviLabel.propTypes = {
  itinerary: itineraryShape.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  setNavigation: PropTypes.func.isRequired,
  focusToPoint: PropTypes.func.isRequired,
  relayEnvironment: relayShape.isRequired,
};

export default NaviLabel;

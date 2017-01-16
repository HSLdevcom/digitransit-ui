import React from 'react';
import ComponentUsageExample from './ComponentUsageExample';


const round = (distance) => {
  if (distance < 1000) return distance - (distance % 10);
  return distance - (distance % 100);
};

const Distance = (props) => {
  let distance;
  let roundedDistance;

  if (props.distance) {
    roundedDistance = round(props.distance);
    if (roundedDistance < 1000) {
      distance = `${roundedDistance}m`;
    } else {
      distance = `${(roundedDistance / 1000).toFixed(1)}km`;
    }
  } else distance = '';

  return <span className="distance">{distance}</span>;
};

Distance.description = () =>
  <div>
    <p>Display distance in correct format. Rounds to 10s of meters
      or if above 1000 then shows kilometers with one decimal.
    </p>
    <ComponentUsageExample description="distance is rounded down">
      <Distance distance={7} />
    </ComponentUsageExample>
    <ComponentUsageExample description="distance">
      <Distance distance={123} />
    </ComponentUsageExample>
    <ComponentUsageExample description="distance in km">
      <Distance distance={3040} />
    </ComponentUsageExample>
  </div>;

Distance.propTypes = {
  distance: React.PropTypes.number.isRequired,
};

Distance.displayName = 'Distance';

export { Distance as default, round };

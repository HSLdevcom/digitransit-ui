import React, { PropTypes } from 'react';
import cx from 'classnames';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import { realtimeDeparture as ExampleData } from '../documentation/ExampleData';
import { intlShape } from 'react-intl';

function RouteDestination(props, context) {
  const mode = props.mode.toLowerCase();
  let destination;
  if (props.isArrival) {
    destination = (
      <span className="destination arrival">
        <span className={cx('last-stop-icon', mode)}></span>
        <span>
        {context.intl.formatMessage({
          id: 'route-destination-arrives',
          defaultMessage: 'Arriving / Last stop',
        })}
        </span>
      </span>);
  } else {
    destination = <span className="destination">{props.destination}</span>;
  }

  return (
    <span className={cx('route-destination', props.className)}>
      {destination}
    </span>);
}

RouteDestination.description = (
  <div>
    <p>Display the destination of the route (headsign)</p>
    <ComponentUsageExample>
      <RouteDestination
        mode={ExampleData.pattern.route.type}
        destination={ExampleData.pattern.headsign ||
            ExampleData.pattern.route.longName}
      />
    </ComponentUsageExample>
    <ComponentUsageExample
      description="isArrival true"
    >
      <RouteDestination
        mode={ExampleData.pattern.route.type}
        destination={ExampleData.pattern.headsign ||
            ExampleData.pattern.route.longName}
        isArrival
      />
    </ComponentUsageExample>
  </div>);

RouteDestination.propTypes = {
  mode: PropTypes.string.isRequired,
  destination: PropTypes.string.isRequired,
  className: PropTypes.string,
  isArrival: PropTypes.bool,
};

RouteDestination.contextTypes = {
  intl: intlShape.isRequired,
};

RouteDestination.displayName = 'RouteDestination';
export default RouteDestination;

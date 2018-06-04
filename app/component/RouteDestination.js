import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';
import { realtimeDeparture as ExampleData } from './ExampleData';

function RouteDestination(props, context) {
  let destination;
  if (props.isArrival) {
    const message = context.intl.formatMessage({
      id: 'route-destination-arrives',
      defaultMessage: 'Arrives / Terminus',
    });
    destination = (
      <span className="destination arrival">
        <span className={cx('last-stop-icon', props.mode.toLowerCase())} />
        <span title={message}>{message}</span>
      </span>
    );
  } else {
    destination = (
      <span className="destination" title={props.destination}>
        {props.destination}
      </span>
    );
  }

  return (
    <span className={cx('route-destination', props.className)}>
      {destination}
    </span>
  );
}

RouteDestination.description = () => (
  <div>
    <p>Display the destination of the route (headsign)</p>
    <ComponentUsageExample>
      <RouteDestination
        mode={ExampleData.pattern.route.mode}
        destination={
          ExampleData.pattern.headsign || ExampleData.pattern.route.longName
        }
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="isArrival true">
      <RouteDestination
        mode={ExampleData.pattern.route.mode}
        destination={
          ExampleData.pattern.headsign || ExampleData.pattern.route.longName
        }
        isArrival
      />
    </ComponentUsageExample>
  </div>
);

RouteDestination.propTypes = {
  mode: PropTypes.string,
  destination: PropTypes.string,
  className: PropTypes.string,
  isArrival: PropTypes.bool,
};

RouteDestination.contextTypes = {
  intl: intlShape.isRequired, // eslint-disable-line react/no-typos
};

RouteDestination.displayName = 'RouteDestination';
export default RouteDestination;

import React, { PropTypes } from 'react';
import RouteScheduleStopSelect from './RouteScheduleStopSelect';
import ComponentUsageExample from './ComponentUsageExample';
import {
  routeScheduleHeaderStops as exampleStops,
} from './ExampleData';

function RouteScheduleHeader(props) {
  const options = props.stops.map((stop, index) => {
    const option = {
      displayName: stop.name,
      value: index,
    };
    return option;
  });
  const fromOptions = options.slice(0, props.to);
  const toOptions = options.slice(props.from + 1);

  return (
    <div className="route-schedule-header row padding-vertical-normal">
      <div className="columns small-6">
        <RouteScheduleStopSelect
          onSelectChange={props.onFromSelectChange}
          selected={props.from}
          options={fromOptions}
        />
      </div>
      <div className="columns small-6">
        <RouteScheduleStopSelect
          onSelectChange={props.onToSelectChange}
          selected={props.to}
          options={toOptions}
        />
      </div>
    </div>);
}
RouteScheduleHeader.propTypes = {
  stops: PropTypes.array.isRequired,
  from: PropTypes.number.isRequired,
  to: PropTypes.number.isRequired,
  onFromSelectChange: PropTypes.func.isRequired,
  onToSelectChange: PropTypes.func.isRequired,
};

RouteScheduleHeader.displayName = 'RouteScheduleHeader';

RouteScheduleHeader.description = () =>
  <div>
    <p>
      Display a route schedule header using react components
    </p>
    <ComponentUsageExample>
      <RouteScheduleHeader
        stops={exampleStops}
        from={0}
        to={4}
        onFromSelectChange={event => event.target.value}
        onToSelectChange={event => event.target.value}
      />
    </ComponentUsageExample>
  </div>;

export default RouteScheduleHeader;

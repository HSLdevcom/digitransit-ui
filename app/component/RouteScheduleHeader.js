import PropTypes from 'prop-types';
import React from 'react';
import RouteScheduleStopSelect from './RouteScheduleStopSelect';
import ComponentUsageExample from './ComponentUsageExample';
import { routeScheduleHeaderStops as exampleStops } from './ExampleData';
import Icon from './Icon';

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
  const fromDisplayName = fromOptions.filter(o => o.value === props.from)[0]
    .displayName;
  const toDisplayName = toOptions.filter(o => o.value === props.to)[0]
    .displayName;

  const stopHeadersForPrinting = (
    <div className="printable-stop-header">
      <div className="printable-stop-header_icon-from">
        <Icon img="icon-icon_mapMarker-point" />
      </div>
      <div className="printable-stop-header_from">
        <span>
          {fromDisplayName}
        </span>
      </div>
      <div className="printable-stop-header_line" />
      <div className="printable-stop-header_icon-to">
        <Icon img="icon-icon_mapMarker-point" />
      </div>
      <div className="printable-stop-header_to">
        <span>
          {toDisplayName}
        </span>
      </div>
    </div>
  );

  return (
    <div className="route-schedule-header row padding-vertical-normal">
      {stopHeadersForPrinting}
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
    </div>
  );
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
    <p>Display a route schedule header using react components</p>
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

import PropTypes from 'prop-types';
import React from 'react';
import RouteScheduleStopSelect from './RouteScheduleStopSelect';
import ComponentUsageExample from './ComponentUsageExample';
import { routeScheduleHeaderStops as exampleStops } from './ExampleData';
import Icon from './Icon';
import { isBrowser } from '../util/browser';

function RouteScheduleHeader({
  stops,
  from,
  to,
  onFromSelectChange,
  onToSelectChange,
}) {
  const options = stops.map((stop, index) => {
    const option = {
      displayName: stop.name,
      value: index,
    };
    return option;
  });
  const fromOptions = options.slice(0, to);
  const toOptions = options.slice(from + 1);

  const fromDisplayName = fromOptions.filter(o => o.value === from)[0]
    .displayName;
  const toDisplayName = toOptions.filter(o => o.value === to)[0].displayName;

  const headerLineStyle = {};
  if (isBrowser) {
    // eslint-disable-next-line global-require
    headerLineStyle.backgroundImage = `url(${require(`../configurations/images/default/dotted-line-bg2.png`)})`;
  }

  const stopHeadersForPrinting = (
    <div className="printable-stop-header">
      <div className="printable-stop-header_icon-from">
        <Icon img="icon-icon_mapMarker-from" />
      </div>
      <div className="printable-stop-header_from">
        <span>{fromDisplayName}</span>
      </div>
      <div className="printable-stop-header_line" style={headerLineStyle} />
      <div className="printable-stop-header_icon-to">
        <Icon img="icon-icon_mapMarker-to" />
      </div>
      <div className="printable-stop-header_to">
        <span>{toDisplayName}</span>
      </div>
    </div>
  );

  return (
    <div className="route-schedule-header row padding-vertical-normal">
      {stopHeadersForPrinting}
      <div className="columns small-6">
        <RouteScheduleStopSelect
          onSelectChange={onFromSelectChange}
          selected={from}
          options={fromOptions}
        />
      </div>
      <div className="columns small-6">
        <RouteScheduleStopSelect
          onSelectChange={onToSelectChange}
          selected={to}
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

RouteScheduleHeader.description = () => (
  <div>
    <p>Display a route schedule header using react components</p>
    <ComponentUsageExample>
      <RouteScheduleHeader
        stops={exampleStops}
        from={0}
        to={1}
        onFromSelectChange={event => event.target.value}
        onToSelectChange={event => event.target.value}
      />
    </ComponentUsageExample>
  </div>
);

export default RouteScheduleHeader;

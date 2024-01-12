import PropTypes from 'prop-types';
import React from 'react';
import Icon from './Icon';
import { isBrowser } from '../util/browser';
import RouteScheduleDropdown from './RouteScheduleDropdown';

function RouteScheduleHeader({
  stops,
  from,
  to,
  onFromSelectChange,
  onToSelectChange,
}) {
  const options = stops.map((stop, index) => {
    const option = {
      label: stop.name,
      value: index,
    };
    return option;
  });

  const maxOptions = Object.keys(options).length;

  const fromOptions = options.slice(0, to > maxOptions ? maxOptions : to);

  const toOptions = options.slice(from + 1);

  const fromDisplayName = fromOptions.filter(o => o.value === from)[0].label;
  const toDisplayName = toOptions.filter(
    o => o.value === (to > maxOptions ? maxOptions : to),
  )[0].label;

  const headerLineStyle = {};
  if (isBrowser) {
    // eslint-disable-next-line global-require
    headerLineStyle.backgroundImage = `url(${require(
      `../configurations/images/default/dotted-line-bg2.png`,
    )})`;
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
    <div className="route-schedule-header row">
      {stopHeadersForPrinting}
      <div className="route-schedule-dropdowns">
        <RouteScheduleDropdown
          id="origin"
          labelId="origin"
          title={fromDisplayName}
          list={fromOptions}
          onSelectChange={onFromSelectChange}
        />
        <RouteScheduleDropdown
          id="destination"
          labelId="destination"
          title={toDisplayName}
          list={toOptions}
          onSelectChange={onToSelectChange}
          alignRight
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

export default RouteScheduleHeader;

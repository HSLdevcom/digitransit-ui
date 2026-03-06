import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../Icon';

/**
 * Displays the selected origin and destination when printing the schedule page.
 * Hidden in the regular view, only shown in print media.
 */
const StopHeaderDisplay = ({ fromDisplayName, toDisplayName }) => {
  return (
    <div className="printable-stop-header">
      <div className="printable-stop-header_icon-from">
        <Icon img="icon_mapMarker" />
      </div>
      <div className="printable-stop-header_from">{fromDisplayName}</div>
      <div className="printable-stop-header_icon-to">
        <Icon img="icon_mapMarker" />
      </div>
      <div className="printable-stop-header_to">{toDisplayName}</div>
    </div>
  );
};

StopHeaderDisplay.propTypes = {
  fromDisplayName: PropTypes.string.isRequired,
  toDisplayName: PropTypes.string.isRequired,
};

StopHeaderDisplay.displayName = 'StopHeaderDisplay';

export default StopHeaderDisplay;

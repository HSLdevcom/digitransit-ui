import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Icon from '../../Icon';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function SelectWeatherStationRow(props, { intl }) {
  const localName = props.names
    ? JSON.parse(props.names)[intl.locale] || props.name
    : props.name;

  return (
    <div className="no-margin">
      <div className="cursor-pointer select-row" onClick={props.selectRow}>
        <div className="padding-vertical-normal select-row-icon">
          <Icon img="icon-icon_stop_monitor" />
        </div>
        <div className="padding-vertical-normal select-row-text">
          <span className="header-primary no-margin link-color">
            {localName} ›
          </span>
        </div>
        <div className="clear" />
      </div>
      <hr className="no-margin gray" />
    </div>
  );
}

SelectWeatherStationRow.displayName = 'SelectWeatherStationRow';

SelectWeatherStationRow.propTypes = {
  selectRow: PropTypes.func.isRequired,
  names: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

SelectWeatherStationRow.contextTypes = {
  intl: intlShape,
};

export default SelectWeatherStationRow;

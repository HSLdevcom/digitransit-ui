import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../Icon';
import { getIcon } from '../sidebar/ChargingStationContent';

export default function SelectChargingStationsRow(props) {
  const { selectRow, properties } = props;
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div className="stop-popup-choose-row" onClick={selectRow}>
      <div className="padding-vertical-normal select-row-icon">
        <Icon img={getIcon(properties)} viewBox="0 0 18 18" />
      </div>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">{properties.name}</h5>
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon-icon_arrow-collapse--right" />
      </span>
      <hr className="no-margin gray" />
    </div>
  );
}

SelectChargingStationsRow.propTypes = {
  selectRow: PropTypes.func.isRequired,
  properties: PropTypes.object.isRequired,
};

SelectChargingStationsRow.contextTypes = {
  intl: PropTypes.object.isRequired,
};

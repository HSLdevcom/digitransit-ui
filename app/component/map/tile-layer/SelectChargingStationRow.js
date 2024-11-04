import React from 'react';
import Link from 'found/Link';
import PropTypes from 'prop-types';
import Icon from '../../Icon';
import { getIcon } from '../sidebar/ChargingStationContent';
import { PREFIX_CHARGING_STATIONS } from '../../../util/path';

export default function SelectChargingStationRow(props) {
  const { properties, latitude, longitude } = props;
  return (
    <Link
      className="stop-popup-choose-row"
      to={`/${PREFIX_CHARGING_STATIONS}?stationId=${properties.id}&lat=${latitude}&lng=${longitude}`}
    >
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
    </Link>
  );
}

SelectChargingStationRow.propTypes = {
  properties: PropTypes.object.isRequired,
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
};

SelectChargingStationRow.contextTypes = {
  intl: PropTypes.object.isRequired,
};

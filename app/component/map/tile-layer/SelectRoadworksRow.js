import React from 'react';
import Link from 'found/Link';
import PropTypes from 'prop-types';
import Icon from '../../Icon';
import Roadworks from './Roadworks';
import { PREFIX_ROADWORKS } from '../../../util/path';

export default function SelectRoadworksRow(props) {
  const { properties, latitude, longitude } = props;

  return (
    <Link
      className="stop-popup-choose-row"
      to={`/${PREFIX_ROADWORKS}?${new URLSearchParams(
        properties,
      ).toString()}&lat=${latitude}&lng=${longitude}`}
    >
      <div className="padding-vertical-normal select-row-icon">
        <Icon
          img={`icon-icon_roadworks${Roadworks.getIconSuffix(properties)}`}
          viewBox="0 0 600.995 600.995"
        />
      </div>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">{properties.street}</h5>
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon-icon_arrow-collapse--right" />
      </span>
      <hr className="no-margin gray" />
    </Link>
  );
}

SelectRoadworksRow.propTypes = {
  properties: PropTypes.object.isRequired,
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
};

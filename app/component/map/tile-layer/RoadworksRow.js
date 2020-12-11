import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../Icon';
import Roadworks from './Roadworks';

export default function RoadworksRow(props) {
  const { selectRow, properties } = props;

  return (
    <div className="no-margin">
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div className="cursor-pointer select-row" onClick={selectRow}>
        <div className="padding-vertical-normal select-row-icon">
          <Icon
            img={`icon-icon_roadworks${Roadworks.getIconSuffix(properties)}`}
            viewBox="0 0 600.995 600.995"
          />
        </div>
        <div className="padding-vertical-normal select-row-text">
          <span className="header-primary no-margin link-color">
            {properties['location.street']}
          </span>
        </div>
        <div className="clear" />
      </div>
      <hr className="no-margin gray" />
    </div>
  );
}

RoadworksRow.propTypes = {
  selectRow: PropTypes.func.isRequired,
  properties: PropTypes.object.isRequired,
};

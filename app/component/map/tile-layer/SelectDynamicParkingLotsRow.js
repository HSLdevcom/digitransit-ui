import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../Icon';
import DynamicParkingLots from './DynamicParkingLots';

export default function SelectDynamicParkingLotsRow(props) {
  const { selectRow, properties } = props;
  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div
        className="stop-popup-choose-row cursor-pointer select-row"
        onClick={selectRow}
      >
        <span className="choose-row-left-column" aria-hidden="true">
          <Icon
            img={`icon-icon_${DynamicParkingLots.getIcon(properties.lotType)}`}
            viewBox="0 0 600.995 600.995"
          />
        </span>
        <span className="choose-row-center-column">
          <h5 className="choose-row-header">{properties.name}</h5>
        </span>
        <span className="choose-row-right-column">
          <Icon img="icon-icon_arrow-collapse--right" />
        </span>
      </div>
    </>
  );
}

SelectDynamicParkingLotsRow.propTypes = {
  selectRow: PropTypes.func.isRequired,
  properties: PropTypes.object.isRequired,
};

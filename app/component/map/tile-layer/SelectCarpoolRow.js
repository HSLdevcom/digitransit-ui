import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../Icon';

export default function SelectCarpoolRow(props) {
  const { selectRow, properties } = props;

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div className="stop-popup-choose-row" onClick={selectRow}>
      <div className="padding-vertical-normal select-row-icon">
        <Icon img="icon-icon_carpark_carpool" viewBox="0 0 600.995 600.995" />
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

SelectCarpoolRow.propTypes = {
  selectRow: PropTypes.func.isRequired,
  properties: PropTypes.object.isRequired,
};

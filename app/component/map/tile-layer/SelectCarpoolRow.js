import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../Icon';

export default function SelectCarpoolRow(props) {
  const { selectRow, properties } = props;

  return (
    <div className="no-margin">
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div className="cursor-pointer select-row" onClick={selectRow}>
        <div className="padding-vertical-normal select-row-icon">
          <Icon img="icon-icon_carpark_carpool" viewBox="0 0 600.995 600.995" />
        </div>
        <div className="padding-vertical-normal select-row-text">
          <span className="header-primary no-margin link-color">
            {properties.name}
          </span>
        </div>
        <div className="clear" />
      </div>
      <hr className="no-margin gray" />
    </div>
  );
}

SelectCarpoolRow.propTypes = {
  selectRow: PropTypes.func.isRequired,
  properties: PropTypes.instanceOf(Object).isRequired,
};

import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../../Icon';
import BikeParks from './BikeParks';

export default function SelectBikeParkRow(props, { intl }) {
  const { selectRow, properties } = props;
  const icon = BikeParks.getIcon(properties);
  const { name } = properties;

  function cleanName(otpBikeparkName) {
    const cleaned = otpBikeparkName.replace('Bicycle parking', '').trim();
    if (cleaned.length) {
      return cleaned;
    }
    return intl.formatMessage({
      id: 'bicycle-parking',
      defaultMessage: 'Bicycle parking',
    });
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div className="stop-popup-choose-row" onClick={selectRow}>
      <div className="padding-vertical-normal select-row-icon">
        <Icon img={icon} viewBox="0 0 18 18" />
      </div>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">{cleanName(name)}</h5>
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon-icon_arrow-collapse--right" />
      </span>
      <hr className="no-margin gray" />
    </div>
  );
}

SelectBikeParkRow.propTypes = {
  selectRow: PropTypes.func.isRequired,
  properties: PropTypes.object.isRequired,
};

SelectBikeParkRow.contextTypes = {
  intl: PropTypes.object.isRequired,
};

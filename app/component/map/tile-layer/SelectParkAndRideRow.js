import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import Icon from '../../Icon';
import { PREFIX_BIKEPARK, PREFIX_CARPARK } from '../../../util/path';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function SelectParkAndRideRow(props) {
  const { name, bikeParkId, carParkId } = props;

  const id = bikeParkId || carParkId;
  const img = carParkId ? 'icon-icon_car-park' : 'icon-icon_bike-park';
  const PREFIX = carParkId ? PREFIX_CARPARK : PREFIX_BIKEPARK;
  return (
    <Link
      className="stop-popup-choose-row"
      to={`/${PREFIX}/${encodeURIComponent(id)}`}
    >
      <span className="choose-row-left-column" aria-hidden="true">
        <Icon img={img} />
      </span>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">{name}</h5>
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon-icon_arrow-collapse--right" />
      </span>
    </Link>
  );
}

SelectParkAndRideRow.displayName = 'SelectParkAndRideRow';

SelectParkAndRideRow.propTypes = {
  bikeParkId: PropTypes.string,
  carParkId: PropTypes.string,
  name: PropTypes.string,
};

export default SelectParkAndRideRow;

import PropTypes from 'prop-types';
import Link from 'found/Link';
import Icon from '../../Icon';
import { PREFIX_BIKEPARK, PREFIX_CARPARK } from '../../../../shared/utils/path';

export default function SelectParkAndRideRow({ name = '', bikeParkId, carParkId }) {
  const id = bikeParkId || carParkId;
  const img = carParkId ? 'icon_car-park' : 'icon_bike-park';
  const PREFIX = carParkId ? PREFIX_CARPARK : PREFIX_BIKEPARK;
  return (
    <Link className="stop-popup-choose-row" to={`/${PREFIX}/${encodeURIComponent(id)}`}>
      <span className="choose-row-left-column" aria-hidden="true">
        <Icon img={img} />
      </span>
      <span className="choose-row-center-column">
        <h4 className="choose-row-header">{name}</h4>
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon_arrow-collapse--right" />
      </span>
    </Link>
  );
}

SelectParkAndRideRow.propTypes = {
  bikeParkId: PropTypes.string,
  carParkId: PropTypes.string,
  name: PropTypes.string,
};

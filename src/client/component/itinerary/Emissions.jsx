import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from '../Icon';
import { itineraryShape } from '../../utils/shapes';
import getCo2Value from '../../utils/emissions';

export default function Emissions({ itinerary, carEmissions, emissionsInfolink }) {
  const co2value = getCo2Value(itinerary);
  if (co2value === null) {
    return null;
  }

  const itineraryIsCar = itinerary.legs.every(leg => leg.mode === 'CAR' || leg.mode === 'WALK');
  const carCo2Value = itineraryIsCar ? null : carEmissions;
  const co2DescriptionId = carCo2Value
    ? 'itinerary-co2.description'
    : 'itinerary-co2.description-simple';
  const values = { co2value, carCo2Value };

  return (
    <div className="itinerary-co2-comparison">
      <div className="itinerary-co2-line">
        <div className="divider-top" />
        <div className="co2-container">
          <div className="co2-description-container">
            <Icon img="icon_co2_leaf" className="co2-leaf" />
            <span className="itinerary-co2-description">
              <span aria-hidden="true">
                <FormattedMessage id={co2DescriptionId} values={values} />
              </span>
              <span className="sr-only">
                <FormattedMessage id={`${co2DescriptionId}-sr`} values={values} />
              </span>
              {emissionsInfolink && (
                <a
                  className="emissions-info-link"
                  href={emissionsInfolink}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FormattedMessage id="itinerary-co2.link" />
                </a>
              )}
            </span>
          </div>
        </div>
        <div className="divider-bottom" />
      </div>
    </div>
  );
}

Emissions.propTypes = {
  itinerary: itineraryShape.isRequired,
  carEmissions: PropTypes.number,
  emissionsInfolink: PropTypes.string,
};

import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import ItineraryShape from '../prop-types/ItineraryShape';
import getCo2Value from '../util/emissions';

const Emissions = ({ itinerary, carItinerary, emissionsInfolink }) => {
  const co2value = getCo2Value(itinerary);
  const itineraryIsCar = itinerary.legs.every(
    leg => leg.mode === 'CAR' || leg.mode === 'WALK',
  );
  const carCo2Value =
    !itineraryIsCar && carItinerary
      ? Math.round(carItinerary?.emissionsPerPerson?.co2)
      : null;
  const useCo2SimpleDesc = !carCo2Value || itineraryIsCar;
  const co2DescriptionId = useCo2SimpleDesc
    ? 'itinerary-co2.description-simple'
    : 'itinerary-co2.description';

  return (
    co2value !== null &&
    co2value >= 0 && (
      <div className="itinerary-co2-comparison">
        <div className="itinerary-co2-line">
          <div className={cx('divider-top')} />
          <div className="co2-container">
            <div className="co2-description-container">
              <Icon img="icon-icon_co2_leaf" className="co2-leaf" />
              <span
                className={cx('itinerary-co2-description', {
                  simple: useCo2SimpleDesc,
                })}
              >
                <span aria-hidden="true">
                  <FormattedMessage
                    id={co2DescriptionId}
                    defaultMessage={`CO₂ emissions for this route: ${co2value} g`}
                    values={{
                      co2value,
                      carCo2Value,
                    }}
                  />
                </span>
                <span className="sr-only">
                  <FormattedMessage
                    id={`${co2DescriptionId}-sr`}
                    defaultMessage={`Carbondioxide emissions for this route: ${co2value} g`}
                    values={{
                      co2value,
                      carCo2Value,
                    }}
                  />
                </span>
                {emissionsInfolink && (
                  <a
                    className="emissions-info-link"
                    href={`${emissionsInfolink}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FormattedMessage
                      id="itinerary-co2.link"
                      defaultMessage="Näin vähennämme päästöjä ›"
                    />
                  </a>
                )}
              </span>
            </div>
          </div>
          <div className={cx('divider-bottom')} />
        </div>
      </div>
    )
  );
};

Emissions.propTypes = {
  itinerary: ItineraryShape.isRequired,
  carItinerary: ItineraryShape,
  emissionsInfolink: PropTypes.string.isRequired,
};

export default Emissions;

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from 'react-intl';
import { Link } from 'found';
import CityBikeStopContent from './CityBikeStopContent';
import { PREFIX_BIKESTATIONS } from '../util/path';
import { hasStationCode } from '../util/citybikes';
import Icon from './Icon';

const CityBikeStopNearYou = ({ stop, currentMode }, { intl }) => {
  const mode = currentMode.toLowerCase();

  return (
    <span role="listitem">
      <div className="stop-near-you-container">
        <Link
          as="button"
          to={`/${PREFIX_BIKESTATIONS}/${stop.stationId}`}
          className="stop-near-you-inner-container"
        >
          <div className="stop-near-you-left-col">
            <span className={mode}>
              <Icon
                img="icon-icon_citybike"
                width={2}
                height={2}
                ariaLabel={intl.formatMessage({ id: mode })}
              />
            </span>
            <div className="bike-station-code">
              <FormattedMessage
                id="citybike-station"
                values={{
                  stationId: hasStationCode(stop) ? stop.stationId : '',
                }}
              />
            </div>
          </div>
          <div className="stop-near-you-right-col">
            <div className="stop-near-you-name">
              {stop.name}
              <Icon
                img="icon-icon_arrow-collapse--right"
                className="itinerary-arrow-icon"
              />
            </div>
            <CityBikeStopContent bikeRentalStation={stop} showIcon={false} />
          </div>
        </Link>
      </div>
    </span>
  );
};
CityBikeStopNearYou.propTypes = {
  stop: PropTypes.object.isRequired,
  currentMode: PropTypes.string.isRequired,
};

CityBikeStopNearYou.contextTypes = {
  intl: intlShape.isRequired,
};

export default CityBikeStopNearYou;

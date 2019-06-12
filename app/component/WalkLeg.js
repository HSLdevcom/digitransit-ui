import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';
import ItineraryCircleLine from './ItineraryCircleLine';
import RouteNumber from './RouteNumber';
import ServiceAlertIcon from './ServiceAlertIcon';
import { getActiveAlertSeverityLevel } from '../util/alertUtils';
import {
  CityBikeNetworkType,
  getCityBikeNetworkId,
  getCityBikeNetworkConfig,
} from '../util/citybikes';
import { displayDistance } from '../util/geo-utils';
import { durationToString } from '../util/timeUtils';

function WalkLeg(
  { children, focusAction, index, leg, previousLeg },
  { config },
) {
  const distance = displayDistance(parseInt(leg.distance, 10), config);
  const duration = durationToString(leg.duration * 1000);
  const modeClassName = 'walk';

  const networkType = getCityBikeNetworkConfig(
    getCityBikeNetworkId(
      previousLeg &&
        previousLeg.rentedBike &&
        previousLeg.from.bikeRentalStation &&
        previousLeg.from.bikeRentalStation.networks,
    ),
    config,
  ).type;

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <div key={index} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode={leg.mode.toLowerCase()} vertical />
      </div>
      <ItineraryCircleLine index={index} modeClassName={modeClassName} />
      <div
        onClick={focusAction}
        className={`small-9 columns itinerary-instruction-column ${leg.mode.toLowerCase()}`}
      >
        <div className="itinerary-leg-first-row">
          <div>
            {previousLeg && previousLeg.rentedBike ? (
              <FormattedMessage
                id={
                  networkType === CityBikeNetworkType.Scooter
                    ? 'return-scooter-to'
                    : 'return-cycle-to'
                }
                values={{ station: leg.from.name }}
                defaultMessage="Return the bike to {station} station"
              />
            ) : (
              leg.from.name
            )}
            <ServiceAlertIcon
              className="inline-icon"
              severityLevel={getActiveAlertSeverityLevel(
                leg.from.stop && leg.from.stop.alerts,
                leg.startTime / 1000,
              )}
            />
            {children}
          </div>
          <Icon img="icon-icon_search-plus" className="itinerary-search-icon" />
        </div>
        <div className="itinerary-leg-action">
          <FormattedMessage
            id="walk-distance-duration"
            values={{ distance, duration }}
            defaultMessage="Walk {distance} ({duration})"
          />
        </div>
      </div>
    </div>
  );
}

const exampleLeg = t1 => ({
  duration: 438,
  startTime: t1 + 10000,
  distance: 483.84600000000006,
  mode: 'WALK',
  from: { name: 'Messukeskus', stop: { code: '0613' } },
});

WalkLeg.description = () => {
  const today = moment()
    .hour(12)
    .minute(34)
    .second(0)
    .valueOf();
  return (
    <div>
      <p>Displays an itinerary walk leg.</p>
      <ComponentUsageExample description="walk-start">
        <WalkLeg leg={exampleLeg(today)} index={0} focusAction={() => {}} />
      </ComponentUsageExample>
      <ComponentUsageExample description="walk-middle">
        <WalkLeg leg={exampleLeg(today)} index={1} focusAction={() => {}} />
      </ComponentUsageExample>
    </div>
  );
};

const walkLegShape = PropTypes.shape({
  distance: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  from: PropTypes.shape({
    name: PropTypes.string.isRequired,
    stop: PropTypes.shape({
      code: PropTypes.string,
    }),
  }).isRequired,
  mode: PropTypes.string.isRequired,
  rentedBike: PropTypes.bool,
  startTime: PropTypes.number.isRequired,
});

WalkLeg.propTypes = {
  children: PropTypes.node,
  focusAction: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  leg: walkLegShape.isRequired,
  previousLeg: walkLegShape,
};

WalkLeg.defaultProps = {
  previousLeg: undefined,
};

WalkLeg.contextTypes = { config: PropTypes.object.isRequired };

export default WalkLeg;

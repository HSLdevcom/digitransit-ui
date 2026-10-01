import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { legShape, legTimeShape } from '../../../utils/client/shapes';
import { displayDistance } from '../../../utils/shared/geo-utils';
import { durationToString } from '../../../utils/client/timeUtils';
import {
  legTime,
  legTimeStr,
  legDestination,
} from '../../../utils/client/legUtils';
import ItineraryCircleLineWithIcon from './ItineraryCircleLineWithIcon';
import ItineraryMapAction from './ItineraryMapAction';
import { splitStringToAddressAndPlace } from '../../../utils/shared/otpStrings';
import { useConfigContext } from '../../client/ConfigContext';

const getDescription = (mode, distance, duration) => {
  if (mode === 'BICYCLE_WALK') {
    return (
      <FormattedMessage
        id="cyclewalk-distance-duration"
        values={{ distance, duration }}
        defaultMessage="Walk your bike {distance} ({duration})"
      />
    );
  }

  if (mode === 'BICYCLE') {
    return (
      <FormattedMessage
        id="cycle-distance-duration"
        values={{ distance, duration }}
        defaultMessage="Cycle {distance} ({duration})"
      />
    );
  }

  return (
    <FormattedMessage
      id="walk-distance-duration"
      values={{ distance, duration }}
      defaultMessage="Walk {distance} ({duration})"
    />
  );
};

function ViaLeg({ leg, arrival, index, children, focusAction, focusToLeg }) {
  const config = useConfigContext();
  const intl = useIntl();
  const distance = displayDistance(
    parseInt(leg.distance, 10),
    config,
    intl.formatNumber,
  );
  const [name, place] = splitStringToAddressAndPlace(leg.from.name);
  const address =
    leg.from.viaLocationType && leg.viaAddress ? leg.viaAddress : name;
  const startTime = legTimeStr(leg.start);
  const arrivalMs = legTime(arrival);
  const arrivalTime = legTimeStr(arrival);
  const duration = durationToString(intl, leg.duration * 1000);
  const stayDuration = legTime(leg.start) - arrivalMs;
  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <div key={index} className="row itinerary-row">
      <span className="sr-only">
        <FormattedMessage
          id="itinerary-details.via-leg"
          defaultMessage="{arrivalTime} saavu välipisteeseen {viaPoint}. {leaveAction}"
          values={{
            arrivalTime,
            viaPoint: leg.from.name,
            leaveAction: (
              <FormattedMessage
                id={
                  leg.mode === 'BICYCLE'
                    ? 'itinerary-details.biking-leg'
                    : 'itinerary-details.walk-leg'
                }
                values={{
                  time: startTime,
                  to: legDestination(intl, leg),
                  distance,
                  origin: leg.from ? leg.from.name : '',
                  destination: leg.to ? leg.to.name : '',
                  duration,
                }}
              />
            ),
          }}
        />
      </span>
      <div
        className="small-2 columns itinerary-time-column via-time-column"
        aria-hidden="true"
      >
        <div className="itinerary-time-column-time via-arrival-time">
          {arrivalTime}
        </div>
        <div className="itinerary-time-column-time via-divider">
          <div className="via-divider-line" />
        </div>
        <div className="itinerary-time-column-time via-departure-time">
          {startTime}
        </div>
      </div>
      <ItineraryCircleLineWithIcon
        viaType={leg.from.viaLocationType}
        isStop={!!leg.from.stop}
        index={index}
        modeClassName={leg.mode.toLowerCase()}
      />
      <div className="small-9 columns itinerary-instruction-column via">
        <span className="sr-only">
          <FormattedMessage
            id="itinerary-summary.show-on-map"
            values={{ target: leg.from.name || '' }}
          />
        </span>
        <div className="itinerary-leg-first-row via">
          <div>
            <div className="address-container">
              <div className="address">{address}</div>
              <div className="place">{place}</div>
            </div>
            {stayDuration > 0 && (
              <div className="itinerary-via-leg-duration">
                <FormattedMessage
                  id="via-leg-stop-duration"
                  values={{
                    stayDuration: durationToString(intl, stayDuration),
                  }}
                  defaultMessage="At via point {stayDuration}"
                />
              </div>
            )}
            {children}
          </div>
          <ItineraryMapAction
            target={leg.from.name || ''}
            focusAction={focusAction}
          />
        </div>
        <div className="itinerary-leg-action itinerary-leg-action-content">
          {getDescription(leg.mode, distance, duration)}
          <ItineraryMapAction target="" focusAction={focusToLeg} />
        </div>
      </div>
    </div>
  );
}

ViaLeg.propTypes = {
  arrival: legTimeShape.isRequired,
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  focusToLeg: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default ViaLeg;

import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { durationToString } from '../util/timeUtils';
import { getHeadsignFromRouteLongName } from '../util/legUtils';
import Icon from './Icon';

const InterlineInfo = ({ legs, leg, wait }) => {
  let totalWait = wait;
  if (legs.length > 1) {
    legs.forEach((iLeg, i) => {
      if (legs[i + 1]) {
        totalWait += legs[i + 1].startTime - iLeg.endTime;
      }
    });
  }
  return (
    <div className="interline-info-container">
      {legs.length === 1 && (
        <>
          <Icon img="icon-icon_wait" />
          <FormattedMessage
            id="itinerary-summary.interline-wait"
            values={{
              shortName: (
                <span className="bold">{legs[0]?.route.shortName}</span>
              ),
              destination: (
                <span className="bold">
                  {legs[0]?.trip.tripHeadsign ||
                    getHeadsignFromRouteLongName(legs[0]?.route)}
                </span>
              ),
              stop: leg.to.name,
              time: <span className="bold">{durationToString(totalWait)}</span>,
            }}
          />
        </>
      )}
      {legs.length > 1 && (
        <>
          <Icon img="icon-icon_wait" />
          <FormattedMessage
            id="itinerary-summary.interline-wait-multiple-legs"
            values={{
              time: <span className="bold">{durationToString(totalWait)}</span>,
            }}
          />
        </>
      )}
    </div>
  );
};

InterlineInfo.propTypes = {
  leg: PropTypes.object,
  legs: PropTypes.arrayOf(
    PropTypes.shape({
      startTime: PropTypes.number,
      route: PropTypes.shape({
        shortName: PropTypes.string,
      }).isRequired,
      trip: PropTypes.shape({
        tripHeadsign: PropTypes.string.isRequired,
      }).isRequired,
    }),
  ).isRequired,
  wait: PropTypes.number,
};
export default InterlineInfo;

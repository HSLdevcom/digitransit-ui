import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { durationToString } from '../util/timeUtils';
import { getHeadsignFromRouteLongName } from '../util/legUtils';
import Icon from './Icon';

const InterlineInfo = ({ legs, leg }) => {
  let totalWait = 0;
  const allLegs = [leg, ...legs];
  const routes = [];
  if (legs.length > 0) {
    allLegs.forEach((iLeg, i) => {
      routes.push(iLeg.route.shortName);
      if (allLegs[i + 1]) {
        totalWait += allLegs[i + 1].startTime - iLeg.endTime;
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
              time: (
                <span className="bold no-wrap">
                  {durationToString(totalWait)}
                </span>
              ),
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
              time: (
                <span className="bold no-wrap">
                  {durationToString(totalWait)}
                </span>
              ),
              shortName: (
                <span className="bold">
                  {Array.from(new Set(routes)).join(', ')}
                </span>
              ),
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
};
export default InterlineInfo;

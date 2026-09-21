import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { durationToString } from '../../../utils/client/timeUtils';
import {
  getHeadsignFromRouteLongName,
  legTime,
} from '../../../utils/client/legUtils';
import Icon from '../Icon';
import { legShape } from '../../../utils/client/shapes';

const InterlineInfo = ({ legs, leg, usingOwnCarWholeTrip }) => {
  const intl = useIntl();
  let totalWait = 0;
  const allLegs = [leg, ...legs];
  const routes = [];
  if (legs.length > 0) {
    allLegs.forEach((iLeg, i) => {
      routes.push(iLeg.route.shortName);
      if (allLegs[i + 1]) {
        totalWait += legTime(allLegs[i + 1].start) - legTime(iLeg.end);
      }
    });
  }
  // the route's short name may stay the same across an interlined transfer
  const shortNameChanges = new Set(routes).size > 1;
  const icon = usingOwnCarWholeTrip ? 'icon_wait-car' : 'icon_wait_sitting';
  return (
    <div className="interline-info-container">
      {legs.length === 1 && (
        <>
          <Icon img={icon} />
          <FormattedMessage
            id={
              shortNameChanges
                ? 'itinerary-summary.interline-wait'
                : 'itinerary-summary.interline-wait-same-route'
            }
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
                  {durationToString(intl, totalWait)}
                </span>
              ),
            }}
          />
        </>
      )}
      {legs.length > 1 && (
        <>
          <Icon img={icon} />
          <FormattedMessage
            id={
              shortNameChanges
                ? 'itinerary-summary.interline-wait-multiple-legs'
                : 'itinerary-summary.interline-wait-multiple-legs-same-route'
            }
            values={{
              time: (
                <span className="bold no-wrap">
                  {durationToString(intl, totalWait)}
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
  leg: legShape.isRequired,
  legs: PropTypes.arrayOf(legShape).isRequired,
  usingOwnCarWholeTrip: PropTypes.bool.isRequired,
};
export default InterlineInfo;

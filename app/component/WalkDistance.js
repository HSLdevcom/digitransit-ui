import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';

import Icon from './Icon';
import { durationToString } from '../util/timeUtils';

function WalkDistance(props) {
  const roundedWalkDistanceInM = Math.round(props.walkDistance / 100) * 100;
  const roundedWalkDistanceInKm = (roundedWalkDistanceInM / 1000).toFixed(1);

  const walkDistance =
    roundedWalkDistanceInM < 1000
      ? `${roundedWalkDistanceInM} m`
      : `${roundedWalkDistanceInKm} km`;

  const icon = `icon-${props.icon || 'icon_walk'}`;
  const mode = props.icon === 'icon_cyclist' ? 'bike' : 'walk';

  const walkDuration = durationToString(props.walkDuration * 1000);

  return (
    <span className={cx(props.className)} style={{ whiteSpace: 'nowrap' }}>
      <span className="sr-only">
        <FormattedMessage
          id={`aria-itinerary-summary-${mode}-distance`}
          values={{ distance: walkDistance }}
        />
      </span>
      <Icon img={icon} />
      <span aria-hidden className="walk-distance">
        {walkDuration}
        <span data-text={walkDistance} />
      </span>
    </span>
  );
}

WalkDistance.description =
  'Displays the total walk distance of the itinerary in precision of 10 meters. ' +
  'Requires walkDistance in meters as props. Displays distance in km if distance is 1000 or above';

WalkDistance.propTypes = {
  walkDistance: PropTypes.number.isRequired,
  icon: PropTypes.string,
  className: PropTypes.string,
  walkDuration: PropTypes.number.isRequired,
};

WalkDistance.displayName = 'WalkDistance';
export default WalkDistance;

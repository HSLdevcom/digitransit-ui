import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage, intlShape } from 'react-intl';
import Icon from './Icon';
import { durationToString } from '../util/timeUtils';
import { displayDistance } from '../util/geo-utils';

function WalkDistance(props, { config, intl }) {
  const walkDistance = displayDistance(
    props.walkDistance,
    config,
    intl.formatNumber,
  );

  const icon = `icon-${props.icon || 'icon_walk'}`;

  const walkDuration = durationToString(props.walkDuration * 1000);

  return (
    <span className={cx(props.className)} style={{ whiteSpace: 'nowrap' }}>
      <span className="sr-only">
        <FormattedMessage
          id={`aria-itinerary-summary-${props.mode}-distance`}
          values={{ distance: walkDistance, duration: walkDuration }}
        />
      </span>
      <Icon img={icon} className={cx(props.mode)} />
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
  mode: PropTypes.string.isRequired,
};

WalkDistance.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

WalkDistance.displayName = 'WalkDistance';
export default WalkDistance;

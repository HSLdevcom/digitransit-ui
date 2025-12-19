import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import Link from 'found/Link';
import { routePagePath, PREFIX_STOPS } from '../../../util/path';
import { getRouteMode } from '../../../util/modeUtils';
import Icon from '../../Icon';

function SelectVehicleRow({ trip }) {
  const mode = getRouteMode(trip.route);
  const iconId = `icon_${mode || 'bus'}`;

  const patternPath = routePagePath(
    trip.route.gtfsId,
    PREFIX_STOPS,
    trip.pattern.code,
    trip.gtfsId,
  );

  const name = trip.pattern.headsign || trip.route.longName;
  return (
    <Link className="stop-popup-choose-row" to={patternPath}>
      <span className="choose-row-left-column" aria-hidden="true">
        <Icon
          className={mode}
          img={iconId}
          color={trip.route.color ? `#${trip.route.color}` : 'currentColor'}
        />
      </span>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">{trip.route.shortName}</h5>
        <span className="choose-row-text">
          <span className="choose-row-address">{name}</span>
        </span>
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon_arrow-collapse--right" />
      </span>
    </Link>
  );
}

const containerComponent = createFragmentContainer(SelectVehicleRow, {
  trip: graphql`
    fragment SelectVehicleRow_trip on Trip {
      gtfsId
      pattern {
        code
        headsign
        stops {
          name
        }
      }
      route {
        gtfsId
        mode
        shortName
        type
        longName
        color
      }
    }
  `,
});

SelectVehicleRow.propTypes = {
  trip: PropTypes.shape({
    gtfsId: PropTypes.string,
    pattern: PropTypes.shape({
      headsign: PropTypes.string,
      code: PropTypes.string.isRequired,
    }),
    route: PropTypes.shape({
      gtfsId: PropTypes.string.isRequired,
      mode: PropTypes.string,
      longName: PropTypes.string,
      shortName: PropTypes.string,
      color: PropTypes.string,
    }).isRequired,
  }).isRequired,
  message: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    tripStartTime: PropTypes.string,
  }).isRequired,
};

export { containerComponent as default, SelectVehicleRow as Component };

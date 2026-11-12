import PropTypes from 'prop-types';
import { useFragment, graphql } from 'react-relay';

import Link from 'found/Link';
import { routePagePath, PREFIX_STOPS } from '../../../../utils/shared/path';
import { getRouteMode } from '../../../../utils/client/modeUtils';
import Icon from '../../Icon';
import { fragmentRefShape } from '../../../../utils/client/shapes';

export default function SelectVehicleRow({ trip: tripRef }) {
  const trip = useFragment(
    graphql`
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
    tripRef,
  );
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
          color={trip.route.color ? `#${trip.route.color}` : null}
        />
      </span>
      <span className="choose-row-center-column">
        <h4 className="choose-row-header">{trip.route.shortName}</h4>
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

SelectVehicleRow.propTypes = {
  trip: fragmentRefShape.isRequired,
  message: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    tripStartTime: PropTypes.string,
  }).isRequired,
};

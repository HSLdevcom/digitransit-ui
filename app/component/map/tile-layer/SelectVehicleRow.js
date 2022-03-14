import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import Link from 'found/Link';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../../../util/path';
import { getRouteMode } from '../../../util/modeUtils';
import Icon from '../../Icon';

function SelectVehicleRow(props) {
  if (!props.trip) {
    return null;
  }
  const mode = getRouteMode(props.trip.route);
  const iconId = `icon-icon_${mode || 'bus'}`;

  let patternPath = `/${PREFIX_ROUTES}/${props.trip.route.gtfsId}/${PREFIX_STOPS}`;

  if (props.trip) {
    patternPath += `/${props.trip.pattern.code}/${props.trip.gtfsId}`;
  }
  const name = props.trip
    ? props.trip.pattern.headsign
    : props.trip.route.longName;
  return (
    <Link className="stop-popup-choose-row" to={patternPath}>
      <span className="choose-row-left-column" aria-hidden="true">
        <Icon
          img={iconId}
          color={
            props.trip.route.color
              ? `#${props.trip.route.color}`
              : 'currentColor'
          }
        />
      </span>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">{props.trip.route.shortName}</h5>
        <span className="choose-row-text">
          <span className="choose-row-address">{name}</span>
        </span>
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon-icon_arrow-collapse--right" />
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

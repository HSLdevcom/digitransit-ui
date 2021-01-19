import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import Link from 'found/Link';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../../../util/path';
import Icon from '../../Icon';

function SelectVehicleRow(props) {
  let iconId;
  switch (props.route.mode) {
    case 'TRAM':
      iconId = 'icon-icon_tram';
      break;
    case 'RAIL':
      iconId = 'icon-icon_rail';
      break;
    case 'BUS':
      iconId = 'icon-icon_bus';
      break;
    case 'SUBWAY':
      iconId = 'icon-icon_subway';
      break;
    default:
      iconId = 'icon-icon_bus';
      break;
  }
  let patternPath = `/${PREFIX_ROUTES}/${props.route.gtfsId}/${PREFIX_STOPS}`;

  if (props.trip) {
    patternPath += `/${props.trip.pattern.code}/${props.trip.gtfsId}`;
  }
  const name = props.trip ? props.trip.pattern.headsign : props.route.longName;
  return (
    <Link className="stop-popup-choose-row" to={patternPath}>
      <span className="choose-row-left-column" aria-hidden="true">
        <Icon img={iconId} />
      </span>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">{props.route.shortName}</h5>
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
    }
  `,
  route: graphql`
    fragment SelectVehicleRow_route on Route {
      gtfsId
      mode
      shortName
      longName
    }
  `,
});

SelectVehicleRow.propTypes = {
  route: PropTypes.shape({
    gtfsId: PropTypes.string.isRequired,
    mode: PropTypes.string,
    longName: PropTypes.string,
    shortName: PropTypes.string,
  }).isRequired,
  trip: PropTypes.shape({
    gtfsId: PropTypes.string,
    pattern: PropTypes.shape({
      headsign: PropTypes.string,
      code: PropTypes.string.isRequired,
    }),
  }).isRequired,
  message: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    tripStartTime: PropTypes.string,
  }).isRequired,
};

export { containerComponent as default, SelectVehicleRow as Component };

import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Link from 'found/Link';
import cx from 'classnames';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';
import VehicleIcon from './VehicleIcon';
import TripLinkWithScroll from './TripLinkWithScroll';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { VehicleShape } from '../util/shapes';

function TripLink({ vehicleState, vehicle, shortName, ...rest }) {
  const { environment } = useContext(ReactRelayContext);
  const icon = (
    <VehicleIcon
      className={cx(vehicle.mode, 'tail-icon')}
      mode={vehicle.mode}
      rotate={180}
      vehicleNumber={vehicle.shortName || shortName}
      useLargeIcon
      color={vehicle.color}
    />
  );
  return (
    <QueryRenderer
      query={graphql`
        query TripLinkQuery($id: String!) {
          trip: trip(id: $id) {
            gtfsId
            pattern {
              code
            }
            route {
              gtfsId
            }
          }
        }
      `}
      variables={{
        id: vehicle.tripId,
      }}
      environment={environment}
      render={({ props }) => {
        if (!props || props.trip === null) {
          return <span className="route-now-content">{icon}</span>;
        }
        if (rest.setHumanScrolling) {
          return (
            <TripLinkWithScroll
              {...rest}
              vehicleState={vehicleState}
              tripId={props.trip.gtfsId}
            />
          );
        }

        const route = props.trip.route.gtfsId;
        const pattern = props.trip.pattern.code;
        const trip = props.trip.gtfsId;
        return (
          <Link
            to={`/${PREFIX_ROUTES}/${route}/${PREFIX_STOPS}/${pattern}/${trip}`}
            className="route-now-content"
            onClick={() => {
              addAnalyticsEvent({
                category: 'Route',
                action: 'OpenTripInformation',
                name: vehicle.mode.toUpperCase(),
              });
            }}
          >
            {icon}
          </Link>
        );
      }}
    />
  );
}

TripLink.propTypes = {
  trip: PropTypes.shape({
    gtfsId: PropTypes.string,
    route: PropTypes.shape({
      gtfsId: PropTypes.string,
    }),
    pattern: PropTypes.shape({
      code: PropTypes.string,
    }),
  }).isRequired,
  vehicle: VehicleShape.isRequired,
  shortName: PropTypes.string,
  vehicleState: PropTypes.string,
};

TripLink.defaultProps = {
  shortName: undefined,
  vehicleState: undefined,
};

export default TripLink;

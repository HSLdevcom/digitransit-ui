import PropTypes from 'prop-types';
import React, { Suspense } from 'react';
import { graphql } from 'react-relay';
import { useLazyLoadQuery } from 'react-relay/hooks';
import Link from 'found/Link';
import cx from 'classnames';
import VehicleIcon from '../VehicleIcon';
import TripLinkWithScroll from './TripLinkWithScroll';
import { routePagePath, PREFIX_STOPS } from '../../../utils/shared/path';
import { addAnalyticsEvent } from '../../../utils/shared/analyticsUtils';
import { vehicleShape } from '../../../utils/client/shapes';
import ErrorBoundary from '../ErrorBoundary';

function TripLinkQuery({ vehicleState, vehicle, shortName, ...rest }) {
  const { trip } = useLazyLoadQuery(
    graphql`
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
    `,
    { id: vehicle.tripId },
  );
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

  if (!trip) {
    return <span className="route-now-content">{icon}</span>;
  }
  if (rest.setHumanScrolling) {
    return (
      <TripLinkWithScroll
        {...rest}
        vehicleState={vehicleState}
        tripId={trip.gtfsId}
      />
    );
  }

  const route = trip.route.gtfsId;
  const pattern = trip.pattern.code;
  const tripId = trip.gtfsId;
  return (
    <Link
      to={routePagePath(route, PREFIX_STOPS, pattern, tripId)}
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
}

TripLinkQuery.propTypes = {
  vehicle: vehicleShape.isRequired,
  shortName: PropTypes.string,
  vehicleState: PropTypes.string,
};

function TripLink(props) {
  const { vehicle, shortName } = props;
  const fallbackIcon = (
    <VehicleIcon
      className={cx(vehicle.mode, 'tail-icon')}
      mode={vehicle.mode}
      rotate={180}
      vehicleNumber={vehicle.shortName || shortName}
      useLargeIcon
      color={vehicle.color}
    />
  );
  const fallback = <span className="route-now-content">{fallbackIcon}</span>;
  return (
    <ErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <TripLinkQuery {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

TripLink.propTypes = {
  vehicle: vehicleShape.isRequired,
  shortName: PropTypes.string,
  vehicleState: PropTypes.string,
};

export default TripLink;

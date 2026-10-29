import PropTypes from 'prop-types';
import React, { Suspense } from 'react';
import { useIntl } from 'react-intl';
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

function FuzzyTripLinkQuery({ vehicle, stopName, nextStopName, ...rest }) {
  const intl = useIntl();
  const icon = (
    <VehicleIcon
      className={cx(rest.mode, 'tail-icon')}
      mode={rest.mode}
      rotate={180}
      vehicleNumber={vehicle.shortName}
      useLargeIcon
      color={vehicle.color}
    />
  );
  const { trip } = useLazyLoadQuery(
    graphql`
      query FuzzyTripLinkQuery(
        $route: String!
        $direction: Int!
        $time: Int!
        $date: String!
      ) {
        trip: fuzzyTrip(
          route: $route
          direction: $direction
          time: $time
          date: $date
        ) {
          gtfsId
          tripShortName
          pattern {
            code
          }
          route {
            gtfsId
          }
        }
      }
    `,
    {
      route: vehicle.route,
      direction: vehicle.direction,
      date: vehicle.operatingDay,
      time:
        vehicle.tripStartTime.substring(0, 2) * 60 * 60 +
        vehicle.tripStartTime.substring(2, 4) * 60,
    },
  );
  if (!trip) {
    return <span className="route-now-content">{icon}</span>;
  }
  if (rest.setHumanScrolling) {
    return (
      <TripLinkWithScroll
        {...rest}
        stopName={stopName}
        nextStopName={nextStopName}
        tripId={trip.gtfsId}
      />
    );
  }

  const route = trip.route.gtfsId;
  const pattern = trip.pattern.code;
  const tripId = trip.gtfsId;
  const { mode } = vehicle;
  const { shortName } = vehicle;
  const localizedMode = intl.formatMessage({
    id: `${mode}`,
    defaultMessage: `${mode}`,
  });
  const ariaMessage = !(rest.vehicleState === 'arrived')
    ? intl.formatMessage(
        {
          id: 'route-page-vehicle-position-between',
          defaultMessage:
            '{mode} {shortName} is between {stopName} and {nextStopName}',
        },
        {
          stopName,
          nextStopName,
          mode: localizedMode,
          shortName: shortName?.toLowerCase(),
        },
      )
    : intl.formatMessage(
        {
          id: 'route-page-vehicle-position',
          defaultMessage: '{mode} {shortName} is at {stopName}',
        },
        {
          stopName,
          mode: localizedMode,
          shortName: shortName?.toLowerCase(),
        },
      );

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
      aria-label={ariaMessage}
    >
      {icon}
    </Link>
  );
}

FuzzyTripLinkQuery.propTypes = {
  vehicle: vehicleShape.isRequired,
  stopName: PropTypes.string.isRequired,
  nextStopName: PropTypes.string,
};

export default function FuzzyTripLink(props) {
  const { vehicle, mode } = props;
  const fallbackIcon = (
    <VehicleIcon
      className={cx(mode, 'tail-icon')}
      mode={mode}
      rotate={180}
      vehicleNumber={vehicle.shortName}
      useLargeIcon
      color={vehicle.color}
    />
  );
  const fallback = <span className="route-now-content">{fallbackIcon}</span>;
  return (
    <ErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <FuzzyTripLinkQuery {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

FuzzyTripLink.propTypes = {
  vehicle: vehicleShape.isRequired,
  stopName: PropTypes.string.isRequired,
  nextStopName: PropTypes.string,
  mode: PropTypes.string,
};

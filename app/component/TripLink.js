import PropTypes from 'prop-types';
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Link from 'found/lib/Link';
import cx from 'classnames';
import IconWithTail from './IconWithTail';
import { PREFIX_ROUTES } from '../util/path';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import getRelayEnvironment from '../util/getRelayEnvironment';

function TripLink({ vehicle, relayEnvironment }) {
  const icon = (
    <IconWithTail
      className={cx(vehicle.mode, 'tail-icon')}
      img={`icon-icon_${vehicle.mode}-live`}
      rotate={180}
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
        id: vehicle.id,
      }}
      environment={relayEnvironment}
      render={({ props }) => {
        if (!props) {
          return <span className="route-now-content">{icon}</span>;
        }

        const route = props.trip.route.gtfsId;
        const pattern = props.trip.pattern.code;
        const trip = props.trip.gtfsId;
        return (
          <Link
            to={`/${PREFIX_ROUTES}/${route}/pysakit/${pattern}/${trip}`}
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
  trip: PropTypes.object.isRequired,
  vehicle: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
  relayEnvironment: PropTypes.object.isRequired,
};

const componentWithRelayEnvinronment = getRelayEnvironment(TripLink);

export { componentWithRelayEnvinronment as default, TripLink as Component };

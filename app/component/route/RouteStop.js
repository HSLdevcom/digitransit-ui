import React from 'react';
import Relay from 'react-relay';
import { FuzzyTripRoute } from '../../queries';
import Link from 'react-router/lib/Link';
import TripLink from '../trip/trip-link';
import WalkDistance from '../itinerary/walk-distance';
import StopCode from '../itinerary/StopCode';

class RouteStop extends React.Component {
  // this component is based on React.component because we need ref to this component
  // TODO make this functional again

  doRender(props) {
    const vehicles = props.vehicles && props.vehicles.map((vehicle) =>
      (<Relay.RootContainer
        key={vehicle.id}
        Component={TripLink}
        route={new FuzzyTripRoute({
          route: vehicle.route,
          direction: vehicle.direction,
          date: vehicle.operatingDay,
          time: vehicle.tripStartTime.substring(0, 2) * 60 * 60 +
            vehicle.tripStartTime.substring(2, 4) * 60,
        })}
        renderFetched={data =>
          (<TripLink
            routeType={vehicle.mode}
            {...data}
          />)
        }
      />)) || [];

    return (
      <div className="route-stop row">
        <div className="columns small-3 route-stop-now">{vehicles}</div>
        <Link to={`/pysakit/${props.stop.gtfsId}`}>
          <div className={`columns small-5 route-stop-name ${props.mode}`}>
            {props.stop.name}&nbsp;
            {props.distance &&
              <WalkDistance
                className="nearest-route-stop"
                icon="icon_location-with-user"
                walkDistance={props.distance}
              />
            }
            <br />
            <StopCode code={props.stop.code} />
            <span className="route-stop-address">{props.stop.desc}</span>
          </div>

          <div className="columns small-2 route-stop-leaves">{props.stop.minutes}</div>
          <div className="columns small-2 route-stop-next">{props.stop.minutes}</div>
        </Link>
      </div>);
  }
  render() {
    return this.doRender(this.props);
  }
}

RouteStop.propTypes = {
  vehicles: React.PropTypes.array,
  stop: React.PropTypes.object,
  mode: React.PropTypes.string,
  distance: React.PropTypes.number,
};

export default RouteStop;

import { locationToOTP } from '../util/otpStrings';
import { getRoutePath } from '../util/path';
import history from '../history';

// eslint-disable-next-line import/prefer-default-export
export function route(actionContext, payload, done) {
  let to;
  let from;
  let geoString;
  const geolocation = actionContext.getStore('PositionStore').getLocationState();
  const origin = actionContext.getStore('EndpointStore').getOrigin();
  const destination = actionContext.getStore('EndpointStore').getDestination();

  if ((origin.lat || (origin.useCurrentPosition && geolocation.hasLocation)) &&
      (destination.lat || (destination.useCurrentPosition && geolocation.hasLocation))) {
    geoString = locationToOTP(Object.assign({
      address: 'Oma sijainti',
    }, geolocation));

    if (origin.useCurrentPosition) {
      from = geoString;
    } else {
      from = locationToOTP(origin);
    }

    if (destination.useCurrentPosition) {
      to = geoString;
    } else {
      to = locationToOTP(destination);
    }

    const path = getRoutePath(from, to);

    if (payload && payload.router && payload.location &&
      payload.location.pathname.indexOf('/reitti') === 0
    ) {
      payload.router.replace({
        ...payload.location,
        state: {  // reset back to 1st alternative at reroute
          ...payload.location.state,
          summaryPageSelected: 0
        },
        pathname: path,
      });
    } else {
      history.push({ pathname: path });
    }
  }

  done();
}

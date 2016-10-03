import { supportsHistory } from 'history/lib/DOMUtils';
import { locationToOTP } from '../util/otp-strings';
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

    if (supportsHistory()) {
      history.push({
        pathname: getRoutePath(from, to),
      });
    }
  }

  return done();
}

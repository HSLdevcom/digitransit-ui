import { locationToOTP } from '../util/otpStrings';
import { getRoutePath } from '../util/path';

// eslint-disable-next-line import/prefer-default-export
export function route(actionContext, payload, done) {
  console.log('ctx', actionContext);
  let to;
  let from;
  let geoString;
  const geolocation = actionContext
    .getStore('PositionStore')
    .getLocationState();
  const isAbleToSearch =
    actionContext.getStore('EndpointStore').hasOrigin() &&
    actionContext.getStore('EndpointStore').hasDestination();

  const origin = actionContext.getStore('EndpointStore').getOrigin();
  const destination = actionContext.getStore('EndpointStore').getDestination();

  if (isAbleToSearch) {
    geoString = locationToOTP(
      Object.assign(
        {
          address: 'Oma sijainti',
        },
        geolocation,
      ),
    );

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
    actionContext.executeAction(navigateAction, { url: path });
    /*
    if (payload && payload.router && payload.location) {
      // Checks if the user is making the first search from the
      // main page
      if (payload.location.pathname.indexOf('/reitti') === 0) {
        payload.router.replace({
          ...payload.location,
          state: {
            // reset back to 1st alternative at reroute
            ...payload.location.state,
            summaryPageSelected: 0,
          },
          pathname: path,
        });
      } else {
        // Will be ran when doing the first search from the main page
        payload.router.push({ ...payload.location, pathname: path });
      }
    } */
  }

  done();
}

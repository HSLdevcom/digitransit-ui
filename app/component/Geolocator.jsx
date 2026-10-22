import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import Loading from './Loading';
import { locationToUri } from '../../utils/shared/otpStrings';
import { usePosition, usePositionActions } from '../hooks/PositionContext';

function Geolocator({ createReturnPath, path, match, router }) {
  const locationState = usePosition();
  const { startLocationWatch } = usePositionActions();
  const { from, to, hash, secondHash } = match.params;
  const { query } = match.location;

  useEffect(() => {
    const redirect = () => {
      const locationForUrl = locationToUri(locationState);
      const newFrom = from === undefined ? locationForUrl : from;
      let { save } = query;
      let newTo;
      if (to === 'POS' || (from !== undefined && to === undefined)) {
        newTo = locationForUrl;
        if (save) {
          if (from === undefined) {
            // both are POS, save nothing
            save = '0';
          } else {
            save = '2'; // save origin only
          }
        }
      } else {
        newTo = to === undefined ? '-' : to;
        if (save) {
          save = '3'; // save destination only
        }
      }
      const returnPath = createReturnPath(
        path,
        newFrom,
        newTo,
        hash,
        secondHash,
      );

      const newLocation = {
        ...match.location,
        pathname: returnPath,
      };
      if (save) {
        newLocation.query.save = save;
      }
      router.replace(newLocation);
    };

    if (locationState.locationingFailed) {
      redirect();
    }
    if (locationState.hasLocation === false) {
      if (
        !locationState.isLocationingInProgress &&
        locationState.status === 'no-location'
      ) {
        startLocationWatch();
      }
    } else if (
      locationState.hasLocation &&
      !locationState.isReverseGeocodingInProgress
    ) {
      redirect();
    }
  }, [
    createReturnPath,
    from,
    hash,
    locationState,
    match.location,
    path,
    query,
    router,
    secondHash,
    to,
  ]);

  return <Loading />;
}

Geolocator.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  path: PropTypes.string.isRequired,
  createReturnPath: PropTypes.func.isRequired,
};

export default Geolocator;

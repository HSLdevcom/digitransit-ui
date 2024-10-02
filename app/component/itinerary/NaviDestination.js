import React, { useEffect, useState } from 'react';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import { legShape, configShape } from '../../util/shapes';
import { displayDistance } from '../../util/geo-utils';
import { durationToString } from '../../util/timeUtils';

function NaviDestination({ leg }, { config, intl }) {
  const { stop, rentalVehicle, vehicleParking, vehicleRentalStation, name } =
    leg.to;
  const { distance, duration } = leg;
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  const stopName = stop?.name || name;
  let n;

  if (rentalVehicle) {
    n = rentalVehicle.rentalNetwork.networkId;
  } else if (vehicleParking) {
    n = vehicleParking.name;
  } else if (vehicleRentalStation) {
    n = vehicleRentalStation.name;
  } else if (stopName) {
    n = stopName;
  }

  return (
    <div className="navileg-destination-details">
      <div>
        {n && (
          <div style={{ display: 'flex' }}>
            {n}
            {stop?.platformCode && (
              <>
                &nbsp; &bull; &nbsp;
                <FormattedMessage
                  id={
                    stop.vehicleMode === 'RAIL' ? 'track-num' : 'platform-num'
                  }
                  values={{ platformCode: stop.platformCode }}
                />
              </>
            )}
          </div>
        )}
        {distance && duration && (
          <div className={cx('duration', fadeOut && 'fade-out')}>
            {durationToString(duration * 1000)} &bull; &nbsp;
            {displayDistance(distance, config, intl.formatNumber)}
          </div>
        )}
      </div>
    </div>
  );
}

NaviDestination.propTypes = {
  leg: legShape.isRequired,
};

NaviDestination.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};

export default NaviDestination;

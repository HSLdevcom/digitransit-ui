import { useEffect, useRef, startTransition } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'found';
import { graphql, useRefetchableFragment } from 'react-relay';
import { PREFIX_BIKEPARK, PREFIX_CARPARK } from '../../../utils/shared/path';
import { isKeyboardSelectionEvent } from '../../../utils/shared/browser';
import { fragmentRefShape } from '../../../utils/client/shapes';
import ParkAndRideContent from '../ParkAndRideContent';
import { useCurrentTime } from '../../hooks/TimeContext';

const parkFragment = graphql`
  fragment ParkNearYou_park on VehicleParking
  @refetchable(queryName: "ParkNearYouQuery") {
    ...ParkAndRideContent_vehicleParking
    vehicleParkingId
    name
    lat
    lon
    availability {
      carSpaces
    }
    parkCapacity: capacity {
      bicycleSpaces
      carSpaces
    }
    openingHours {
      osm
    }
    tags
    realtime
  }
`;

export default function ParkNearYou({
  park: parkRef,
  isParentTabActive = false,
  mode,
}) {
  const currentTime = useCurrentTime();
  const [park, refetch] = useRefetchableFragment(parkFragment, parkRef);

  const mounted = useRef(false);

  useEffect(() => {
    // data was just fetched by the parent query
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (isParentTabActive) {
      startTransition(() => {
        refetch({}, { fetchPolicy: 'network-only' });
      });
    }
  }, [currentTime, isParentTabActive]);

  const prefix = mode === 'BIKEPARK' ? PREFIX_BIKEPARK : PREFIX_CARPARK;
  return (
    <span role="listitem">
      <div className="stop-near-you-container-with-hover">
        <div className="stop-near-you-header-container">
          <div className="stop-header-content">
            <Link
              onClick={e => {
                e.stopPropagation();
              }}
              onKeyPress={e => {
                if (isKeyboardSelectionEvent(e)) {
                  e.stopPropagation();
                }
              }}
              to={`/${prefix}/${park.vehicleParkingId}`}
            >
              <ParkAndRideContent
                vehicleParking={park}
                mode={mode}
                showInfo={false}
                backButton={false}
                showDetails={false}
              />
            </Link>
          </div>
        </div>
      </div>
    </span>
  );
}

ParkNearYou.propTypes = {
  park: fragmentRefShape.isRequired,
  isParentTabActive: PropTypes.bool,
  mode: PropTypes.string.isRequired,
};

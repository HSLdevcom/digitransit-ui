import PropTypes from 'prop-types';
import { Link } from 'found';
import { useRefetchableFragment } from 'react-relay';
import { PREFIX_BIKEPARK, PREFIX_CARPARK } from '../../../shared/utils/path';
import { isKeyboardSelectionEvent } from '../../../shared/utils/browser';
import { fragmentRefShape } from '../../utils/shapes';
import ParkAndRideContent from '../ParkAndRideContent';
import useRefetchOnTick from '../../hooks/useRefetchOnTick';
import ParkNearYouFragment from './queries/ParkNearYouFragment';

export default function ParkNearYou({ park: parkRef, isParentTabActive = false, mode }) {
  const [park, refetch] = useRefetchableFragment(ParkNearYouFragment, parkRef);

  useRefetchOnTick(refetch, ParkNearYouFragment, parkRef, isParentTabActive);

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

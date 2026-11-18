import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'found';
import { useRefetchableFragment } from 'react-relay';
import VehicleRentalStation from '../VehicleRentalStation';
import FavouriteVehicleRentalStationContainer from '../FavouriteVehicleRentalStationContainer';
import { PREFIX_BIKESTATIONS } from '../../../utils/shared/path';
import { isKeyboardSelectionEvent } from '../../../utils/shared/browser';
import { hasVehicleRentalCode } from '../../../utils/shared/vehicleRentalUtils';
import { fragmentRefShape } from '../../../utils/client/shapes';
import { splitGtfsId } from '../../../utils/shared/gtfs';
import useRefetchOnTick from '../../hooks/useRefetchOnTick';
import VehicleRentalStationNearYouFragment from './queries/VehicleRentalStationNearYouFragment';

export default function VehicleRentalStationNearYou({
  station: stationRef,
  isParentTabActive = false,
}) {
  const [station, refetch] = useRefetchableFragment(
    VehicleRentalStationNearYouFragment,
    stationRef,
  );

  useRefetchOnTick(
    refetch,
    VehicleRentalStationNearYouFragment,
    stationRef,
    isParentTabActive,
  );

  return (
    <span role="listitem">
      <div className="stop-near-you-container">
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
              to={`/${PREFIX_BIKESTATIONS}/${station.stationId}`}
            >
              <h3 className="stop-near-you-name">{station.name}</h3>
            </Link>
            <div className="bike-station-code">
              <FormattedMessage
                id="citybike-station"
                values={{
                  stationId: hasVehicleRentalCode(station.stationId)
                    ? splitGtfsId(station.stationId).entityId
                    : '',
                }}
              />
            </div>
          </div>
          <FavouriteVehicleRentalStationContainer
            vehicleRentalStation={station}
            className="bike-rental-favourite-container"
          />
        </div>
        <VehicleRentalStation vehicleRentalStation={station} />
      </div>
    </span>
  );
}

VehicleRentalStationNearYou.propTypes = {
  station: fragmentRefShape.isRequired,
  isParentTabActive: PropTypes.bool,
};

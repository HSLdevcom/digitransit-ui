import { graphql, useFragment } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import StopPageMap from './map/StopPageMap';
import { fragmentRefShape } from '../../utils/client/shapes';

export default function RentalVehiclePageMapContainer({
  rentalVehicle: rentalVehicleRef,
}) {
  const rentalVehicle = useFragment(
    graphql`
      fragment RentalVehiclePageMapContainer_rentalVehicle on RentalVehicle {
        lat
        lon
        name
      }
    `,
    rentalVehicleRef,
  );
  if (!rentalVehicle) {
    return false;
  }
  const stopName =
    rentalVehicle.name.toLowerCase() === 'scooter' ? (
      <FormattedMessage id="e-scooter" defaultMessage={rentalVehicle.name} />
    ) : (
      rentalVehicle.name
    );
  return <StopPageMap stop={rentalVehicle} stopName={stopName} scooter />;
}

RentalVehiclePageMapContainer.propTypes = {
  rentalVehicle: fragmentRefShape,
};

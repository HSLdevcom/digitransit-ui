import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, useIntl } from 'react-intl';
import { useRouter } from 'found';
import {
  vehicleRentalStationShape,
  errorShape,
} from '../../utils/client/shapes';
import VehicleRentalStation from './VehicleRentalStation';
import Disclaimer from './Disclaimer';
import ParkOrStationHeader from './ParkOrStationHeader';
import { useBreakpoint } from '../hooks/BreakpointContext';
import { getRentalNetworkConfig } from '../../utils/shared/vehicleRentalUtils';
import { PREFIX_BIKESTATIONS } from '../../utils/shared/path';
import { TransportMode } from '../../utils/shared/constants';
import { useConfigContext } from '../hooks/ConfigContext';

const VehicleRentalStationContent = ({ vehicleRentalStation, error }) => {
  const breakpoint = useBreakpoint();
  const config = useConfigContext();
  const { locale } = useIntl();
  const { router } = useRouter();
  // throw error when relay query fails
  if (error && !vehicleRentalStation) {
    throw error.message;
  }

  if (!vehicleRentalStation && !error) {
    router.replace(`/${PREFIX_BIKESTATIONS}`);
    return null;
  }
  const { availableVehicles, capacity } = vehicleRentalStation;
  const vehiclesAvailable = availableVehicles.total;
  const isFull = vehiclesAvailable >= capacity;

  const networkConfig = getRentalNetworkConfig(
    vehicleRentalStation.rentalNetwork.networkId,
    config,
  );
  const { vehicleRental } = config;
  const returnInstructionsUrl = networkConfig.returnInstructions?.[locale];
  const href = vehicleRental.buyUrl?.[locale] || networkConfig?.url?.[locale];
  const linkLabelId = vehicleRental.buyUrl?.[locale]
    ? 'citybike-purchase-link'
    : 'citybike-start-using-info';
  return (
    <div className="station-page-container">
      <div className="large-header">
        <ParkOrStationHeader
          parkOrStation={vehicleRentalStation}
          breakpoint={breakpoint}
        />
      </div>
      <VehicleRentalStation vehicleRentalStation={vehicleRentalStation} />
      {vehicleRental.showFullInfo && isFull && (
        <div className="citybike-full-station-guide">
          <FormattedMessage id="citybike-return-full" />
          <a
            onClick={e => {
              e.stopPropagation();
            }}
            className="external-link-citybike"
            href={returnInstructionsUrl}
            target="_blank"
            rel="noreferrer"
          >
            {' '}
            <FormattedMessage id="citybike-return-full-link" />
          </a>
        </div>
      )}
      {networkConfig.type === TransportMode.Citybike.toLowerCase() && href && (
        <>
          <br />
          <Disclaimer
            header={<FormattedMessage id="citybike-start-using" />}
            text={vehicleRental.buyInstructions?.[locale]}
            href={href}
            linkLabel={<FormattedMessage id={linkLabelId} />}
          />
        </>
      )}
    </div>
  );
};

VehicleRentalStationContent.propTypes = {
  vehicleRentalStation: vehicleRentalStationShape.isRequired,
  error: errorShape,
};

const containerComponent = createFragmentContainer(
  VehicleRentalStationContent,
  {
    vehicleRentalStation: graphql`
      fragment VehicleRentalStationContent_vehicleRentalStation on VehicleRentalStation {
        lat
        lon
        name
        availableVehicles {
          total
        }
        availableSpaces {
          total
        }
        capacity
        rentalNetwork {
          networkId
        }
        stationId
        operative
      }
    `,
  },
);

export {
  containerComponent as default,
  VehicleRentalStationContent as Component,
};

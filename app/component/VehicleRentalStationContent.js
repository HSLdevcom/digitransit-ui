import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { routerShape } from 'found';
import { vehicleRentalStationShape, errorShape } from '../util/shapes';
import VehicleRentalStation from './VehicleRentalStation';
import Disclaimer from './Disclaimer';
import ParkOrStationHeader from './ParkOrStationHeader';
import withBreakpoint from '../util/withBreakpoint';
import { getRentalNetworkConfig } from '../util/vehicleRentalUtils';
import { PREFIX_BIKESTATIONS } from '../util/path';
import { TransportMode } from '../constants';
import { useConfigContext } from '../configurations/ConfigContext';

const VehicleRentalStationContent = ({
  vehicleRentalStation,
  breakpoint,
  router,
  error,
}) => {
  const config = useConfigContext();
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
  const { vehicleRental, language } = config;
  const returnInstructionsUrl = networkConfig.returnInstructions?.[language];
  const href =
    vehicleRental.buyUrl?.[language] || networkConfig?.url?.[language];
  const linkLabelId = vehicleRental.buyUrl?.[language]
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
            text={vehicleRental.buyInstructions?.[language]}
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
  breakpoint: PropTypes.string.isRequired,
  router: routerShape.isRequired,
  error: errorShape,
};

VehicleRentalStationContent.defaultProps = {
  error: undefined,
};

const VRCWithBreakpoint = withBreakpoint(VehicleRentalStationContent);

const containerComponent = createFragmentContainer(VRCWithBreakpoint, {
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
});

export { containerComponent as default, VRCWithBreakpoint as Component };

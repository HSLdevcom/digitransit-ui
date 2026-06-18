import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'found';
import Icon from './Icon';
import withBreakpoint from '../util/withBreakpoint';
import {
  getRentalNetworkIcon,
  getRentalNetworkConfig,
} from '../util/vehicleRentalUtils';
import { PREFIX_RENTALVEHICLES } from '../util/path';
import VehicleRentalLeg from './itinerary/VehicleRentalLeg';
import BackButton from './BackButton';
import { rentalVehicleShape } from '../util/shapes';
import { useConfigContext } from '../configurations/ConfigContext';

function RentalVehicleContent({
  rentalVehicle,
  breakpoint,
  error = undefined,
}) {
  const [isClient, setClient] = useState(false);
  const config = useConfigContext();
  const { match, router } = useRouter();

  useEffect(() => {
    setClient(true);
  }, []);

  useEffect(() => {
    if (!rentalVehicle && !error) {
      router.replace(`/${PREFIX_RENTALVEHICLES}`);
    }
  }, [rentalVehicle, error, router]);

  const networks = match.params.networks?.split(',');

  // throw error in client side relay query fails
  if (isClient && error && !rentalVehicle) {
    throw error.message;
  }

  if (!rentalVehicle && !error) {
    return null;
  }

  const networkConfig = getRentalNetworkConfig(
    rentalVehicle.rentalNetwork.networkId,
    config,
  );
  const vehicleIcon = getRentalNetworkIcon(networkConfig);
  const { language } = config;

  if (networks) {
    return (
      <div className="scooter-page-container">
        <div className="scooter-cluster-back-button-container">
          {breakpoint === 'large' && <BackButton />}
        </div>
        <div className="scooter-sub-header scooters-available">
          <FormattedMessage id="e-scooters-available" />
        </div>
        {networks.map(network => (
          <div key={network} className="scooter-box cluster">
            <div className="scooter-content-container cluster">
              <Icon img={vehicleIcon} />
              <div className="scooter-header">
                <div className="header">
                  <h1>
                    {networkConfig.name[language] ||
                      rentalVehicle.rentalNetwork.networkId}
                  </h1>
                  <div className="scooter-sub-header">
                    <FormattedMessage id="e-scooter" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="scooter-page-container">
      <div className="scooter-box">
        <div className="scooter-content-container">
          <Icon img={vehicleIcon} />
          <div className="scooter-header">
            {breakpoint === 'large' && <BackButton />}
            <div className="header">
              <h1>
                {networkConfig.name[language] ||
                  rentalVehicle.rentalNetwork.networkId}
              </h1>
              <div className="scooter-sub-header">
                <FormattedMessage id="e-scooter" />
              </div>
            </div>
          </div>
        </div>

        <div className="disclaimer-content">
          <VehicleRentalLeg isScooter rentalVehicle={rentalVehicle} />
        </div>
      </div>
    </div>
  );
}

RentalVehicleContent.propTypes = {
  rentalVehicle: rentalVehicleShape,
  breakpoint: PropTypes.string.isRequired,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
};

const RentalVehicleContentWithBreakpoint = withBreakpoint(RentalVehicleContent);

const containerComponent = createFragmentContainer(
  RentalVehicleContentWithBreakpoint,
  {
    rentalVehicle: graphql`
      fragment RentalVehicleContent_rentalVehicle on RentalVehicle {
        lat
        lon
        name
        vehicleId
        rentalUris {
          android
          ios
          web
        }
        rentalNetwork {
          networkId
          url
        }
      }
    `,
  },
);

export default containerComponent;

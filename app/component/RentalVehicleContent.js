import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import { routerShape, RedirectException } from 'found';
import Icon from './Icon';
import withBreakpoint from '../util/withBreakpoint';
import {
  getVehicleRentalStationNetworkIcon,
  getVehicleRentalStationNetworkConfig,
} from '../util/vehicleRentalUtils';
import { isBrowser } from '../util/browser';
import { PREFIX_RENTALVEHICLES } from '../util/path';
import VehicleRentalLeg from './VehicleRentalLeg';
import BackButton from './BackButton';

const RentalVehicleContent = (
  { rentalVehicle, breakpoint, router, error, language },
  { config },
) => {
  const [isClient, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  });

  // throw error in client side relay query fails
  if (isClient && error && !rentalVehicle) {
    throw error.message;
  }

  if (!rentalVehicle && !error) {
    if (isBrowser) {
      router.replace(`/${PREFIX_RENTALVEHICLES}`);
    } else {
      throw new RedirectException(`/${PREFIX_RENTALVEHICLES}`);
    }
    return null;
  }
  const networkConfig = getVehicleRentalStationNetworkConfig(
    rentalVehicle.network,
    config,
  );
  const vehicleIcon = getVehicleRentalStationNetworkIcon(
    networkConfig,
    !rentalVehicle.operative,
  );

  return (
    <div className="scooter-page-container">
      <div className="scooter-box">
        <div className="scooter-content-container">
          <Icon img={vehicleIcon} />
          <div className="scooter-header">
            {breakpoint === 'large' && (
              <BackButton
                icon="icon-icon_arrow-collapse--left"
                iconClassName="arrow-icon"
              />
            )}
            <div className="header">
              <h1>{networkConfig.name[language] || rentalVehicle.network}</h1>
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
};

RentalVehicleContent.propTypes = {
  rentalVehicle: PropTypes.any.isRequired,
  breakpoint: PropTypes.string.isRequired,
  router: routerShape.isRequired,
  error: PropTypes.object,
  language: PropTypes.string.isRequired,
};

RentalVehicleContent.contextTypes = {
  config: PropTypes.object.isRequired,
};

const RentalVehicleContentWithBreakpoint = withBreakpoint(RentalVehicleContent);

const connectedComponent = connectToStores(
  RentalVehicleContentWithBreakpoint,
  ['PreferencesStore'],
  ({ getStore }) => {
    const language = getStore('PreferencesStore').getLanguage();
    return { language };
  },
);

const containerComponent = createFragmentContainer(connectedComponent, {
  /* mitä muita tietoja rentalvehicleltä */
  rentalVehicle: graphql`
    fragment RentalVehicleContent_rentalVehicle on RentalVehicle {
      lat
      lon
      name
      network
      vehicleId
      rentalUris {
        android
        ios
        web
      }
      systemUrl
    }
  `,
});

export {
  containerComponent as default,
  RentalVehicleContentWithBreakpoint as Component,
};

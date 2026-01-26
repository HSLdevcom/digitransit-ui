import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import { routerShape } from 'found';
import {
  configShape,
  vehicleRentalStationShape,
  errorShape,
} from '../util/shapes';
import VehicleRentalStation from './VehicleRentalStation';
import ParkOrStationHeader from './ParkOrStationHeader';
import Icon from './Icon';
import withBreakpoint from '../util/withBreakpoint';
import { getRentalNetworkConfig } from '../util/vehicleRentalUtils';
import { PREFIX_BIKESTATIONS } from '../util/path';
import { TransportMode } from '../constants';

const VehicleRentalStationContent = (
  { vehicleRentalStation, breakpoint, language, router, error },
  { config },
) => {
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
  const cityBikeNetworkUrl = networkConfig?.url?.[language];
  let returnInstructionsUrl;
  if (networkConfig.returnInstructions) {
    returnInstructionsUrl = networkConfig.returnInstructions[language];
  }
  const { vehicleRental } = config;
  const cityBikeBuyUrl = vehicleRental.buyUrl?.[language];
  const buyInstructions = cityBikeBuyUrl
    ? vehicleRental.buyInstructions?.[language]
    : undefined;

  return (
    <div className="bike-station-page-container">
      <ParkOrStationHeader
        parkOrStation={vehicleRentalStation}
        breakpoint={breakpoint}
      />
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
      {networkConfig.type === TransportMode.Citybike.toLowerCase() &&
        (cityBikeBuyUrl || cityBikeNetworkUrl) && (
          <div className="citybike-use-disclaimer">
            <h2 className="disclaimer-header">
              <FormattedMessage id="citybike-start-using" />
            </h2>
            <div className="disclaimer-content">
              {buyInstructions || (
                <a
                  className="external-link-citybike"
                  href={cityBikeNetworkUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FormattedMessage id="citybike-start-using-info" />
                </a>
              )}
            </div>
            {cityBikeBuyUrl && (
              <a
                onClick={e => {
                  e.stopPropagation();
                }}
                className="external-link"
                href={cityBikeBuyUrl}
                target="_blank"
                rel="noreferrer"
              >
                <FormattedMessage id="citybike-purchase-link" />
                <Icon img="icon_external-link-box" />
              </a>
            )}
          </div>
        )}
    </div>
  );
};

VehicleRentalStationContent.propTypes = {
  vehicleRentalStation: vehicleRentalStationShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  router: routerShape.isRequired,
  error: errorShape,
};

VehicleRentalStationContent.defaultProps = {
  error: undefined,
};

VehicleRentalStationContent.contextTypes = {
  config: configShape.isRequired,
};

const VehicleRentalStationContentWithBreakpoint = withBreakpoint(
  VehicleRentalStationContent,
);

const connectedComponent = connectToStores(
  VehicleRentalStationContentWithBreakpoint,
  ['PreferencesStore'],
  context => ({
    language: context.getStore('PreferencesStore').getLanguage(),
  }),
);

const containerComponent = createFragmentContainer(connectedComponent, {
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

export {
  containerComponent as default,
  VehicleRentalStationContentWithBreakpoint as Component,
};

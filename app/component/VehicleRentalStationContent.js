import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import { routerShape, RedirectException } from 'found';
import { configShape } from '../util/shapes';

import VehicleRentalStation from './VehicleRentalStation';
import ParkOrStationHeader from './ParkOrStationHeader';
import Icon from './Icon';
import withBreakpoint from '../util/withBreakpoint';
import { getVehicleRentalStationNetworkConfig } from '../util/vehicleRentalUtils';
import { isBrowser } from '../util/browser';
import { PREFIX_BIKESTATIONS } from '../util/path';

const VehicleRentalStationContent = (
  { vehicleRentalStation, breakpoint, language, router, error },
  { config },
) => {
  const [isClient, setClient] = useState(false);

  useEffect(() => {
    // To prevent SSR from rendering something https://reactjs.org/docs/react-dom.html#hydrate
    setClient(true);
  });

  // throw error in client side relay query fails
  if (isClient && error && !vehicleRentalStation) {
    throw error.message;
  }

  if (!vehicleRentalStation && !error) {
    if (isBrowser) {
      router.replace(`/${PREFIX_BIKESTATIONS}`);
    } else {
      throw new RedirectException(`/${PREFIX_BIKESTATIONS}`);
    }
    return null;
  }
  const { vehiclesAvailable, capacity } = vehicleRentalStation;
  const isFull = vehiclesAvailable >= capacity;

  const networkConfig = getVehicleRentalStationNetworkConfig(
    vehicleRentalStation.network,
    config,
  );
  const cityBikeNetworkUrl = networkConfig?.url?.[language];
  let returnInstructionsUrl;
  if (networkConfig.returnInstructions) {
    returnInstructionsUrl = networkConfig.returnInstructions[language];
  }
  const { cityBike } = config;
  const cityBikeBuyUrl = cityBike.buyUrl?.[language];
  const buyInstructions = cityBikeBuyUrl
    ? cityBike.buyInstructions?.[language]
    : undefined;

  return (
    <div className="bike-station-page-container">
      <ParkOrStationHeader
        parkOrStation={vehicleRentalStation}
        breakpoint={breakpoint}
      />
      <VehicleRentalStation vehicleRentalStation={vehicleRentalStation} />
      {cityBike.showFullInfo && isFull && (
        <div className="citybike-full-station-guide">
          <FormattedMessage id="citybike-return-full" />
          <a
            onClick={e => {
              e.stopPropagation();
            }}
            className="external-link-citybike"
            href={returnInstructionsUrl}
          >
            {' '}
            <FormattedMessage id="citybike-return-full-link" />
          </a>
        </div>
      )}
      {(cityBikeBuyUrl || cityBikeNetworkUrl) && (
        <div className="citybike-use-disclaimer">
          <h2 className="disclaimer-header">
            <FormattedMessage id="citybike-start-using" />
          </h2>
          <div className="disclaimer-content">
            {buyInstructions || (
              <a className="external-link-citybike" href={cityBikeNetworkUrl}>
                <FormattedMessage id="citybike-start-using-info" />
              </a>
            )}
          </div>
          {isClient && cityBikeBuyUrl && (
            <a
              onClick={e => {
                e.stopPropagation();
              }}
              className="external-link"
              href={cityBikeBuyUrl}
            >
              <FormattedMessage id="citybike-purchase-link" />
              <Icon img="icon-icon_external-link-box" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

VehicleRentalStationContent.propTypes = {
  vehicleRentalStation: PropTypes.object.isRequired,
  breakpoint: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  router: routerShape.isRequired,
  error: PropTypes.object,
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
      spacesAvailable
      vehiclesAvailable
      capacity
      network
      stationId
      operative
    }
  `,
});

export {
  containerComponent as default,
  VehicleRentalStationContentWithBreakpoint as Component,
};

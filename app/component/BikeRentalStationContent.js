import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import { routerShape, RedirectException } from 'found';

import CityBikeStopContent from './CityBikeStopContent';
import ParkOrStationHeader from './ParkOrStationHeader';
import Icon from './Icon';
import withBreakpoint from '../util/withBreakpoint';
import { isBrowser, isMobile, isAndroid, isIOS } from '../util/browser';
import {
  getCityBikeNetworkConfig,
  getCityBikeNetworkName,
} from '../util/citybikes';
import { PREFIX_BIKESTATIONS } from '../util/path';
import CargoBikeContent from './map/sidebar/CargoBikeContent';

const BikeRentalStationContent = (
  { bikeRentalStation, breakpoint, language, router, error },
  { config },
) => {
  const [isClient, setClient] = useState(false);
  useEffect(() => {
    // To prevent SSR from rendering something https://reactjs.org/docs/react-dom.html#hydrate
    setClient(true);
  });

  // throw error in client side relay query fails
  if (isClient && error && !bikeRentalStation) {
    throw error.message;
  }

  if (!bikeRentalStation && !error) {
    if (isBrowser) {
      router.replace(`/${PREFIX_BIKESTATIONS}`);
    } else {
      throw new RedirectException(`/${PREFIX_BIKESTATIONS}`);
    }
    return null;
  }
  const { bikesAvailable, capacity } = bikeRentalStation;
  const isFull = bikesAvailable >= capacity;

  const networkConfig = getCityBikeNetworkConfig(
    bikeRentalStation.networks[0],
    config,
  );

  // todo: remove Stadtnavi Herrenberg-specific stuff?
  if (
    bikeRentalStation.networks[0] === 'cargo-bike' &&
    bikeRentalStation.stationId === 'cargobike-herrenberg'
  ) {
    return <CargoBikeContent slug={bikeRentalStation.stationId} />;
  }

  let cityBikeNetworkUrl = networkConfig?.url
    ? networkConfig.url[language]
    : '';
  if (bikeRentalStation.rentalUris) {
    if (isMobile && isIOS && bikeRentalStation.rentalUris.ios) {
      cityBikeNetworkUrl = bikeRentalStation.rentalUris.ios;
    } else if (isMobile && isAndroid && bikeRentalStation.rentalUris.android) {
      cityBikeNetworkUrl = bikeRentalStation.rentalUris.android;
    } else if (bikeRentalStation.rentalUris.web) {
      cityBikeNetworkUrl = bikeRentalStation.rentalUris.web;
    }
  }
  let returnInstructionsUrl;
  if (networkConfig.returnInstructions) {
    returnInstructionsUrl = networkConfig.returnInstructions[language];
  }
  const { cityBike } = config;
  const cityBikeBuyUrl = cityBike.buyUrl?.[language];
  const buyInstructions = cityBikeBuyUrl
    ? cityBike.buyInstructions?.[language]
    : undefined;

  const formFactor = networkConfig.type || 'citybike';
  const networkName = getCityBikeNetworkName(networkConfig, language);

  return (
    <div className="bike-station-page-container">
      <ParkOrStationHeader
        parkOrStation={bikeRentalStation}
        breakpoint={breakpoint}
      />
      <CityBikeStopContent bikeRentalStation={bikeRentalStation} />
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
            <FormattedMessage id="citybike-return-full-link" />{' '}
          </a>
        </div>
      )}
      {cityBikeNetworkUrl && (
        <div className="citybike-use-disclaimer">
          <h2 className="disclaimer-header">
            <FormattedMessage id={`${formFactor}-start-using`} />
          </h2>
          <div className="disclaimer-content">
            {buyInstructions || (
              <a className="external-link-citybike" href={cityBikeNetworkUrl}>
                <FormattedMessage id={`${formFactor}-start-using-info`} />{' '}
                {networkName}
              </a>
            )}
          </div>
          {isClient && cityBikeBuyUrl && (
            <a
              onClick={e => {
                e.stopPropagation();
              }}
              className="external-link"
              target="_blank"
              rel="noreferrer"
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
BikeRentalStationContent.propTypes = {
  bikeRentalStation: PropTypes.any,
  breakpoint: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  router: routerShape.isRequired,
  error: PropTypes.object,
};
BikeRentalStationContent.contextTypes = {
  config: PropTypes.object.isRequired,
};
const BikeRentalStationContentWithBreakpoint = withBreakpoint(
  BikeRentalStationContent,
);

const connectedComponent = connectToStores(
  BikeRentalStationContentWithBreakpoint,
  ['PreferencesStore'],
  context => ({
    language: context.getStore('PreferencesStore').getLanguage(),
  }),
);

const containerComponent = createFragmentContainer(connectedComponent, {
  bikeRentalStation: graphql`
    fragment BikeRentalStationContent_bikeRentalStation on BikeRentalStation {
      lat
      lon
      name
      spacesAvailable
      bikesAvailable
      capacity
      networks
      stationId
      state
      rentalUris {
        web
        android
        ios
      }
    }
  `,
});

export {
  containerComponent as default,
  BikeRentalStationContentWithBreakpoint as Component,
};

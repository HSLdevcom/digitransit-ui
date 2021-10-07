import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import { routerShape, RedirectException } from 'found';

import CityBikeStopContent from './CityBikeStopContent';
import BikeRentalStationHeader from './BikeRentalStationHeader';
import Icon from './Icon';
import withBreakpoint from '../util/withBreakpoint';
import { getCityBikeNetworkConfig } from '../util/citybikes';
import { isBrowser } from '../util/browser';
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
  if (isClient && error) {
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
  let url = networkConfig?.url ? networkConfig.url[language] : '';
  if (bikeRentalStation.rentalUris && bikeRentalStation.rentalUris.web) {
    url = bikeRentalStation.rentalUris.web;
  }
  let returnInstructionsUrl;
  if (networkConfig.returnInstructions) {
    returnInstructionsUrl = networkConfig.returnInstructions[language];
  }
  const { cityBike } = config;
  const cityBikeBuyUrl = cityBike.buyUrl;

  if (
    bikeRentalStation.networks[0] === 'cargo-bike' &&
    bikeRentalStation.stationId === 'cargobike-herrenberg'
  ) {
    return <CargoBikeContent slug={bikeRentalStation.stationId} />;
  }

  return (
    <div className="bike-station-page-container">
      <BikeRentalStationHeader
        bikeRentalStation={bikeRentalStation}
        breakpoint={breakpoint}
      />
      <CityBikeStopContent bikeRentalStation={bikeRentalStation} />
      {config.cityBike.showFullInfo && isFull && (
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
      {url && (
        <div className="citybike-use-disclaimer">
          <div className="disclaimer-header">
            <FormattedMessage
              id={`${bikeRentalStation.networks[0]}-start-using`}
            />
          </div>
          <div className="disclaimer-content">
            {cityBikeBuyUrl ? (
              <FormattedMessage id="citybike-buy-season" />
            ) : (
              <a className="external-link-citybike" href={url}>
                <FormattedMessage id="citybike-start-using-info" />{' '}
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
              href={url}
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
      }
    }
  `,
});

export {
  containerComponent as default,
  BikeRentalStationContentWithBreakpoint as Component,
};

import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import { RedirectException, routerShape } from 'found';

import CityBikeStopContent from './CityBikeStopContent';
import BikeRentalStationHeader from './BikeRentalStationHeader';
import Icon from './Icon';
import withBreakpoint from '../util/withBreakpoint';
import { getCityBikeNetworkConfig } from '../util/citybikes';
import { isBrowser } from '../util/browser';
import { PREFIX_BIKESTATIONS } from '../util/path';

const BikeRentalStationContent = (
  { bikeRentalStation, breakpoint, language, router },
  { config },
) => {
  const [isClient, setClient] = useState(false);
  useEffect(() => {
    // To prevent SSR from rendering something https://reactjs.org/docs/react-dom.html#hydrate
    setClient(true);
  });

  if (!bikeRentalStation) {
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
  const url = networkConfig?.url ? networkConfig.url[language] : '';
  let returnInstructionsUrl;
  if (networkConfig.returnInstructions) {
    returnInstructionsUrl = networkConfig.returnInstructions[language];
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
            <FormattedMessage id="citybike-start-using" />
          </div>
          <div className="disclaimer-content">
            <FormattedMessage id="citybike-buy-season" />
          </div>
          {isClient && (
            <a
              onClick={e => {
                e.stopPropagation();
              }}
              className="external-link"
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
    }
  `,
});

export {
  containerComponent as default,
  BikeRentalStationContentWithBreakpoint as Component,
};

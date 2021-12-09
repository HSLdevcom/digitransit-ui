/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect } from 'react';
import { matchShape } from 'found';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import CtrlPanel from '@digitransit-component/digitransit-component-control-panel';
import { intlShape } from 'react-intl';
import { getRefPoint } from '../util/apiUtils';
import withSearchContext from './WithSearchContext';
import {
  getPathWithEndpointObjects,
  PREFIX_ITINERARY_SUMMARY,
} from '../util/path';
import Icon from './Icon';

const LocationSearch = withSearchContext(DTAutosuggestPanel);

// test case: http://localhost:8080/embedded-search?daddress=Opastinsilta%206%20A,%20Helsinki&dlat=60.199118&dlon=24.940652&bikeOnly=1

/**
 *  A search component that can be embedded to other sites using iframe
 *  optimized for widths 320px, 360px and  640px, and height 250px.
 *
 */
const EmbeddedSearch = (props, context) => {
  const { query } = props.match.location;
  const { config, intl } = context;
  const { colors, fontWeights } = config;
  const bikeOnly = query?.bikeOnly;
  const walkOnly = query?.walkOnly;

  const deafultOriginExists = query.olat && query.olon;
  const defaultOrigin = {
    lat: Number(query.olat),
    lon: Number(query.olon),
    address: query.oaddress,
  };
  const defaultDestinationExists = query.dlat && query.dlon;
  const defaultDestination = {
    lat: Number(query.dlat),
    lon: Number(query.dlon),
    address: query.daddress,
    name: query.daddress,
  };
  const [logo, setLogo] = useState();
  const [origin, setOrigin] = useState(
    deafultOriginExists ? defaultOrigin : {},
  );
  const [destination, setDestination] = useState(
    defaultDestinationExists ? defaultDestination : {},
  );

  const color = colors.primary;
  const hoverColor = colors.hover;
  const appElement = 'embedded-root';
  const lang = intl.locale || 'fi';
  let titleText;
  if (bikeOnly) {
    titleText = intl.formatMessage({
      id: 'find-bike-route',
      defaultMessage: 'Find a biking route',
    });
  } else if (walkOnly) {
    titleText = intl.formatMessage({
      id: 'find-walk-route',
      defaultMessage: 'Find a walking route',
    });
  } else {
    titleText = intl.formatMessage({
      id: 'find-route',
      defaultMessage: 'Find a route',
    });
  }

  const locationSearchTargets = [
    'Locations',
    'CurrentPosition',
    'FutureRoutes',
    'Stops',
  ];
  const sources = ['Datasource'];
  const refPoint = getRefPoint(origin, destination, {});

  const onSelectLocation = (item, id) => {
    if (id === 'origin') {
      setOrigin(item);
    } else {
      setDestination(item);
    }
  };

  const locationSearchProps = {
    appElement: '#app',
    origin,
    destination,
    lang,
    sources,
    color,
    hoverColor,
    refPoint,
    searchPanelText: titleText,
    originPlaceHolder: 'search-origin-index',
    destinationPlaceHolder: 'search-destination-index',
    selectHandler: onSelectLocation,
    onGeolocationStart: onSelectLocation,
    fontWeights,
    modeIconColors: config.colors.iconColors,
    modeSet: config.iconModeSet,
    isMobile: true,
  };

  const executeSearch = () => {
    const urlEnd = bikeOnly ? '/bike' : walkOnly ? '/walk' : '';
    const pathName = `${getPathWithEndpointObjects(
      origin,
      destination,
      PREFIX_ITINERARY_SUMMARY,
    )}${urlEnd}`;
    if (window.self !== window.top) {
      window.parent.location.href = pathName;
    } else {
      window.location.href = pathName;
    }
  };

  // eslint-disable-next-line consistent-return
  const drawBackgroundIcon = () => {
    if (bikeOnly) {
      return (
        <Icon
          img="icon-embedded-search-bike-background"
          className="background"
          color={config.colors.primary}
        />
      );
    }
    if (walkOnly) {
      return (
        <Icon
          img="icon-embedded-search-walk-background"
          className="background"
          color={config.colors.primary}
        />
      );
    }
  };

  useEffect(() => {
    import(
      /* webpackChunkName: "main" */ `../configurations/images/${config.logo}`
    ).then(l => {
      setLogo(l.default);
    });
  }, []);

  return (
    <div
      className={`embedded-seach-container ${
        bikeOnly ? 'bike' : walkOnly ? 'walk' : ''
      }`}
      id={appElement}
    >
      {drawBackgroundIcon()}
      <CtrlPanel
        instance="HSL"
        language={lang}
        origin={origin}
        position="left"
        fontWeights={fontWeights}
      >
        <span className="sr-only">
          {intl.formatMessage({
            id: 'search-fields.sr-instructions',
            defaultMessage:
              'The search is triggered automatically when origin and destination are set. Changing any search parameters triggers a new search',
          })}
        </span>
        <LocationSearch
          targets={locationSearchTargets}
          {...locationSearchProps}
        />
        <div className="embedded-search-button-container">
          <img src={logo} className="brand-logo" alt={`${config.title} logo`} />
          <button
            className="search-button"
            type="button"
            onClick={() => executeSearch(origin, destination)}
          >
            {intl.formatMessage({
              id: 'search-route',
              defaultMessage: 'Search a route',
            })}
          </button>
        </div>
      </CtrlPanel>
    </div>
  );
};

EmbeddedSearch.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

EmbeddedSearch.propTypes = {
  match: matchShape.isRequired,
};

export default EmbeddedSearch;

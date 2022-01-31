/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect } from 'react';
import { matchShape } from 'found';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import CtrlPanel from '@digitransit-component/digitransit-component-control-panel';
import i18next from 'i18next';
import { getRefPoint } from '../util/apiUtils';
import withSearchContext from './WithSearchContext';
import {
  getPathWithEndpointObjects,
  PREFIX_ITINERARY_SUMMARY,
} from '../util/path';
import Icon from './Icon';

const LocationSearch = withSearchContext(DTAutosuggestPanel, true);

const translations = {
  fi: {
    'own-position': 'Nykyinen sijaintisi',
    'find-bike-route': 'Löydä pyöräreitti',
    'find-walk-route': 'Löydä kävelyreitti',
    'find-route': 'Löydä reitti',
    'search-fields.sr-instructions': '',
    'search-route': 'Hae reitti',
  },
  en: {
    'own-position': 'Your current location',
    'find-bike-route': 'Find a biking route',
    'find-walk-route': 'Find a walking route',
    'find-route': 'Find a route',
    'search-fields.sr-instructions': '',
    'search-route': 'Search routes',
  },
  sv: {
    'own-position': 'Min position',
    'find-bike-route': 'Sök en cyckelrutt',
    'find-walk-route': 'Sök en promenadsrutt',
    'find-route': 'Sök en rutt',
    'search-fields.sr-instructions': '',
    'search-route': 'Söka rutter',
  },
};

i18next.init({
  fallbackLng: 'fi',
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
});

// test case: http://localhost:8080/haku?address2=Opastinsilta%206%20A,%20Helsinki&lat2=60.199118&lon2=24.940652&bikeOnly=1

/**
 *  A search component that can be embedded to other sites using iframe
 *  optimized for widths 320px, 360px and  640px, and height 250px.
 *
 */
const EmbeddedSearch = (props, context) => {
  const { query } = props.match.location;
  const { config } = context;
  const { colors, fontWeights } = config;
  const bikeOnly = query?.bikeOnly;
  const walkOnly = query?.walkOnly;
  const lang = query.lang || 'fi';

  useEffect(() => {
    Object.keys(translations).forEach(language => {
      i18next.addResourceBundle(
        language,
        'translation',
        translations[language],
      );
    });
  });

  const defaultOriginExists = query.lat1 && query.lon1;
  const defaultOrigin = {
    lat: Number(query.lat1),
    lon: Number(query.lon1),
    address: query.address1,
    name: query.address1,
  };
  const useCurrentLocation = !defaultOriginExists; // query?.loc; // Current location as default
  const defaultDestinationExists = query.lat2 && query.lon2;
  const defaultDestination = {
    lat: Number(query.lat2),
    lon: Number(query.lon2),
    address: query.address2,
    name: query.address2,
  };
  const [logo, setLogo] = useState();
  const [origin, setOrigin] = useState(
    useCurrentLocation
      ? {
          type: 'CurrentLocation',
          status: 'no-location',
          address: i18next.t('own-position'),
        }
      : defaultOriginExists
      ? defaultOrigin
      : {},
  );
  const [destination, setDestination] = useState(
    defaultDestinationExists ? defaultDestination : {},
  );

  useEffect(() => {
    setOrigin(
      useCurrentLocation
        ? {
            type: 'CurrentLocation',
            status: 'no-location',
            address: i18next.t('own-position'),
          }
        : defaultOriginExists
        ? defaultOrigin
        : {},
    );
    setDestination(defaultDestinationExists ? defaultDestination : {});
  }, [query]);

  const color = colors.primary;
  const hoverColor = colors.hover;
  const appElement = 'embedded-root';
  let titleText;
  if (bikeOnly) {
    titleText = i18next.t('find-bike-route');
  } else if (walkOnly) {
    titleText = i18next.t('find-walk-route');
  } else {
    titleText = i18next.t('find-route');
  }

  const locationSearchTargets = [
    'Locations',
    'CurrentPosition',
    'FutureRoutes',
    'Stops',
  ];
  const sources = ['Favourite', 'History', 'Datasource'];
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
    showScroll: true,
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

  if (i18next.language !== lang) {
    i18next.changeLanguage(lang);
  }

  return (
    <div
      className={`embedded-seach-container ${
        bikeOnly ? 'bike' : walkOnly ? 'walk' : ''
      }`}
      id={appElement}
    >
      <div className="background-container">{drawBackgroundIcon()}</div>
      <div className="control-panel-container">
        <CtrlPanel
          instance="HSL"
          language={lang}
          origin={origin}
          position="left"
          fontWeights={fontWeights}
        >
          <span className="sr-only">
            {i18next.t('search-fields.sr-instructions')}
          </span>
          <LocationSearch
            targets={locationSearchTargets}
            {...locationSearchProps}
          />
          <div className="embedded-search-button-container">
            <img
              src={logo}
              className="brand-logo"
              alt={`${config.title} logo`}
            />
            <button
              className="search-button"
              type="button"
              onClick={() => executeSearch(origin, destination)}
            >
              {i18next.t('search-route')}
            </button>
          </div>
        </CtrlPanel>
      </div>
    </div>
  );
};

EmbeddedSearch.contextTypes = {
  config: PropTypes.object.isRequired,
};

EmbeddedSearch.propTypes = {
  match: matchShape.isRequired,
};

export default EmbeddedSearch;

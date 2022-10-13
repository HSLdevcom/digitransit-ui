/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect, useRef } from 'react';
import { matchShape } from 'found';
import DTAutosuggestPanel from '@digitransit-component/digitransit-component-autosuggest-panel';
import CtrlPanel from '@digitransit-component/digitransit-component-control-panel';
import i18next from 'i18next';
import { getRefPoint } from '../../util/apiUtils';
import withSearchContext from '../WithSearchContext';
import {
  buildQueryString,
  buildURL,
  getPathWithEndpointObjects,
  PREFIX_ITINERARY_SUMMARY,
} from '../../util/path';
import Icon from '../Icon';
import Loading from '../Loading';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import useUTMCampaignParams from './hooks/useUTMCampaignParams';

const LocationSearch = withSearchContext(DTAutosuggestPanel, true);

const translations = {
  fi: {
    'own-position': 'Nykyinen sijaintisi',
    'find-bike-route': 'Löydä pyöräreitti',
    'find-walk-route': 'Löydä kävelyreitti',
    'find-route': 'Löydä reitti',
    'search-fields-sr-instructions': '',
    'search-route': 'Hae reitti',
  },
  en: {
    'own-position': 'Your current location',
    'find-bike-route': 'Find a biking route',
    'find-walk-route': 'Find a walking route',
    'find-route': 'Find a route',
    'search-fields-sr-instructions': '',
    'search-route': 'Search routes',
  },
  sv: {
    'own-position': 'Min position',
    'find-bike-route': 'Sök en cyckelrutt',
    'find-walk-route': 'Sök en promenadsrutt',
    'find-route': 'Sök en rutt',
    'search-fields-sr-instructions': '',
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
  const url =
    window.location !== window.parent.location
      ? document.referrer
      : document.location.href;

  const buttonRef = useRef(null);

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
  const useOriginLocation = query?.originLoc;
  const defaultDestinationExists = query.lat2 && query.lon2;
  const defaultDestination = {
    lat: Number(query.lat2),
    lon: Number(query.lon2),
    address: query.address2,
    name: query.address2,
  };
  const useDestinationLocation = query?.destinationLoc;
  const [logo, setLogo] = useState();
  const [origin, setOrigin] = useState(
    useOriginLocation
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
    useDestinationLocation
      ? {
          type: 'CurrentLocation',
          status: 'no-location',
          address: i18next.t('own-position'),
        }
      : defaultDestinationExists
      ? defaultDestination
      : {},
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOrigin(
      useOriginLocation
        ? {
            type: 'CurrentLocation',
            status: 'no-location',
            address: i18next.t('own-position'),
          }
        : defaultOriginExists
        ? defaultOrigin
        : {},
    );
    setDestination(
      useDestinationLocation
        ? {
            type: 'CurrentLocation',
            status: 'no-location',
            address: i18next.t('own-position'),
          }
        : defaultDestinationExists
        ? defaultDestination
        : {},
    );
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
    if (item?.type === 'CurrentLocation') {
      // eslint-disable-next-line no-param-reassign
      item.address = i18next.t('own-position');
    }
    if (id === 'origin') {
      addAnalyticsEvent({
        category: 'EmbeddedSearch',
        action: 'setOrigin',
        name: url,
        origin: item.address,
      });
      setOrigin(item);
    } else {
      addAnalyticsEvent({
        category: 'EmbeddedSearch',
        action: 'setDestination',
        name: url,
        destination: item.address,
      });
      setDestination(item);
      if (origin) {
        buttonRef?.current.focus();
      }
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
    isEmbedded: true,
  };

  const mode = bikeOnly ? 'bike' : walkOnly ? 'walk' : 'all';

  const utmCampaignParams = useUTMCampaignParams({
    mode,
    hasOrigin: Boolean(defaultOriginExists),
    hasDest: Boolean(defaultDestinationExists),
  });

  const executeSearch = () => {
    const urlEnd = bikeOnly ? '/bike' : walkOnly ? '/walk' : '';

    const targetUrl = buildURL([
      lang,
      getPathWithEndpointObjects(origin, destination, PREFIX_ITINERARY_SUMMARY),
      urlEnd,
    ]);

    targetUrl.search += buildQueryString(utmCampaignParams);

    addAnalyticsEvent({
      category: 'EmbeddedSearch',
      action: 'executeSearch',
      name: url,
      mode,
      origin: origin?.address,
      destination: destination?.address,
    });
    window.open(targetUrl.href, '_blank');
  };

  // eslint-disable-next-line consistent-return
  const drawBackgroundIcon = () => {
    if (bikeOnly) {
      return (
        <Icon
          img="icon-embedded-search-bike-background"
          className="background bike"
          color={config.colors.primary}
        />
      );
    }
    if (walkOnly) {
      return (
        <Icon
          img="icon-embedded-search-walk-background"
          className="background walk"
          color={config.colors.primary}
        />
      );
    }
  };

  useEffect(() => {
    import(
      /* webpackChunkName: "embedded-search" */ `../../configurations/images/${
        config.secondaryLogo || config.logo
      }`
    ).then(l => {
      setLogo(l.default);
      setLoading(false);
    });
  }, []);

  if (i18next.language !== lang) {
    i18next.changeLanguage(lang);
  }

  if (loading) {
    return <Loading />;
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
            {i18next.t('search-fields-sr-instructions')}
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
              ref={buttonRef}
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

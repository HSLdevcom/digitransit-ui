/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { intlShape } from 'react-intl';
import { matchShape } from 'found';
import LazilyLoad, { importLazy } from './LazilyLoad';
import { clearOldSearches, clearFutureRoutes } from '../util/storeUtils';
import { getJson } from '../util/xhrPromise';

const modules = {
  SiteHeader: () => importLazy(import('@hsl-fi/site-header')),
  SharedLocalStorageObserver: () =>
    importLazy(import('@hsl-fi/shared-local-storage')),
};

const clearStorages = context => {
  clearOldSearches(context);
  clearFutureRoutes(context);
  context.getStore('FavouriteStore').clearFavourites();
};

const AppBarHsl = ({ lang, user }, context) => {
  const { config, match, intl } = context;
  const { location } = match;

  const [banners, setBanners] = useState([]);

  useEffect(() => {
    if (config.URL.BANNERS && config.NODE_ENV !== 'test') {
      getJson(`${config.URL.BANNERS}&language=${lang}`).then(data =>
        setBanners(data),
      );
    }
  }, [lang]);

  const languages = [
    {
      name: 'fi',
      url: `/fi${location.pathname}${location.search}`,
    },
    {
      name: 'sv',
      url: `/sv${location.pathname}${location.search}`,
    },
    {
      name: 'en',
      url: `/en${location.pathname}${location.search}`,
    },
  ];

  const { given_name, family_name } = user;

  const initials =
    given_name && family_name
      ? given_name.charAt(0) + family_name.charAt(0)
      : ''; // Authenticated user's initials, will be shown next to Person-icon.

  const url = encodeURI(location.pathname);
  const params = location.search && location.search.substring(1);
  const userMenu =
    config.allowLogin && (user.sub || user.notLogged)
      ? {
          userMenu: {
            isLoading: false, // When fetching for login-information, `isLoading`-property can be set to true. Spinner will be shown.
            isAuthenticated: true, // If user is authenticated, set `isAuthenticated`-property to true.
            // @TODO: Replace with user's idToken
            idToken:
              'eyJraWQiOiJpbml0aWFsIHNpZ25pbmcga2V5IDIwMTctMTItMTgiLCJhbGciOiJSUzI1NiJ9.eyJleHAiOjE2NDQ4Mzg2MDIsImlhdCI6MTY0NDIzMzgwMiwiYXRfaGFzaCI6ImJQX1V4UUp6azRsZjhmT1BBTzQ5UWciLCJzdWIiOiI2MjAxMDQ0YWMzZWY2MzZkYjM2ZmQ4OGIiLCJhbXIiOlsicHdkIl0sImlzcyI6Imh0dHBzOi8vaHNsaWQtdWF0LmNpbmZyYS5maSIsImh0dHBzOi8vb25lcG9ydGFsLnRyaXZvcmUuY29tL2NsYWltcy9zdHVkZW50Ijp7ImVkdWNhdGlvbl9wcm92aWRlcl9pZCI6bnVsbCwibGFzdF9xdWVyeV9zdWNjZXNzIjpmYWxzZSwiZWR1Y2F0aW9uX3Byb3ZpZGVyX25hbWUiOm51bGwsImVkdWNhdGlvbl9sZXZlbCI6bnVsbCwic3RhdGUiOiJ1bmtub3duIiwic291cmNlIjoibGVnYWwiLCJlZHVjYXRpb25fdHlwZSI6bnVsbCwibGFzdF9xdWVyeV9lcnJvciI6bnVsbH0sInByZWZlcnJlZF91c2VybmFtZSI6IjI4Nzg1NTMwIiwibG9jYWxlIjoiZmkiLCJodHRwczovL29uZXBvcnRhbC50cml2b3JlLmNvbS9jbGFpbXMvdGFncyI6W10sImh0dHBzOi8vb25lcG9ydGFsLnRyaXZvcmUuY29tL2NsYWltcy9uYW1lc3BhY2UiOiJoc2wtYW5vbiIsInVwZGF0ZWRfYXQiOjE2NDQyMzM4MDIsImF6cCI6IjM1NTE0MDg0ODI5MjY2ODUiLCJodHRwczovL29uZXBvcnRhbC50cml2b3JlLmNvbS9jbGFpbXMvbGVnYWxfbmFtZXMiOnt9LCJhdXRoX3RpbWUiOjE2NDQyMzM4MDIsImVtYWlsIjoidGFmZS5oZWlza2FuZW4rODg4QGdtYWlsLmNvbSIsImV0Yi9jbGFpbXMvYmVuZWZpdHMiOltdLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImh0dHBzOi8vb25lcG9ydGFsLnRyaXZvcmUuY29tL2NsYWltcy9sb2NhbGl0eSI6e30sInBob25lX251bWJlcl92ZXJpZmllZCI6ZmFsc2UsImh0dHBzOi8vb25lcG9ydGFsLnRyaXZvcmUuY29tL2NsYWltcy9kb21pY2lsZV9jbGFzc2VzIjpbXSwiZ2l2ZW5fbmFtZSI6IlRhcGlvIiwiaHR0cHM6Ly9vbmVwb3J0YWwudHJpdm9yZS5jb20vY2xhaW1zL21pbm9yIjpmYWxzZSwiYXVkIjoiMzU1MTQwODQ4MjkyNjY4NSIsImh0dHBzOi8vb25lcG9ydGFsLnRyaXZvcmUuY29tL2NsYWltcy9sZWdhbF9sb2NhbGl0eSI6e30sIm5hbWUiOiJUYXBpbyBIZWlza2FuZW4iLCJwaG9uZV9udW1iZXIiOiIrMzU4NDA4MzQzNjAwIiwiZmFtaWx5X25hbWUiOiJIZWlza2FuZW4iLCJodHRwczovL29uZXBvcnRhbC50cml2b3JlLmNvbS9jbGFpbXMvY29uc2VudHMiOnsiaW50ZXJ2aWV3X2VtYWlsIjp0cnVlLCJtYXJrZXRpbmdfZW1haWwiOmZhbHNlLCJzdXJ2ZXlfbW9iaWxlIjp0cnVlLCJtYXJrZXRpbmdfbW9iaWxlIjpmYWxzZSwibG9jYXRpb25pbmciOmZhbHNlLCJtYXJrZXRpbmdQb3N0IjpmYWxzZSwicmVsZWFzZV90YXJnZXRlZF9tb2JpbGUiOnRydWUsInJlbGVhc2VfZ2VuZXJhbF9lbWFpbCI6dHJ1ZSwibWFya2V0aW5nUGhvbmUiOmZhbHNlLCJzdXJ2ZXlfZW1haWwiOnRydWUsIm1hcmtldGluZ1B1c2hOb3RpZmljYXRpb24iOmZhbHNlLCJsZXR0ZXJfZW1haWwiOnRydWUsInByb2ZpbGluZyI6ZmFsc2UsIm1hcmtldGluZ090aGVyIjpmYWxzZSwiaW50ZXJ2aWV3X21vYmlsZSI6dHJ1ZSwibWFya2V0aW5nRW1haWwiOmZhbHNlLCJyZWxlYXNlX2dlbmVyYWxfbW9iaWxlIjp0cnVlLCJyZWxlYXNlX3RhcmdldGVkX2VtYWlsIjp0cnVlLCJtYXJrZXRpbmdNb2JpbGVNZXNzYWdlIjpmYWxzZX19.tUPrPX2Mwl6EYfRIIN5jRfbgp4rag9t8JJp2R_tHjno_KTR0FFpv-rT0dl5aTmzmbCTasvCwxHYQsJikiTvAmHC0ovRTZarb97omcv8EHL7nuo0SQeqAonRTHMdPqmErvlqVF-LIFwefzjsKEC032rAR4MGEQpKaIOKP7ruXkSSZNDWQMrxXwAHTyPMHeYQDWPA-1OaF4E7cDXsClYhOUuymGB72GvUX8vHPiaujTVZAEBYdLjGKzYXx92mu0JqMrVC2J0Q1pe-FVJX_WzwiV8CEHNyEbTVPxqmMTYV6clihxIrhTVrrDvQ2YpROUFZqjV4-bvXTTO-FXYI_HFpyXil1y6f_KJX6j6VY6O1y0GLG3DD5FxKthll8w8MpgGRKyTDfNFZt-btUOQOnKZy2OxH9y2rxTAKxHHCUCSljQwXUc11QbcSsZxUIuH_3N15bMk1g-w9Z2J_yWNNyuaWQtB_RX1eFd9QK34v5XYCLfTiM7N19fjwPkTDryW5PyDSnQpVqY6_Na98XSnQneBhnFDPsL0PE8GvEQZsNmeczJr1DBj2ctR4alDS5k4PNpyVeGRIDey1Hi_HkjSoa8E0c9tkqFS3b-iDNtgc1zmbd5gyJN3ibNE2eRIT-f4SWUoUoecXZe1fdwGMbn7VUioDt7u1-urK8oomdl8UimvcdgXg',
            isSelected: false,
            loginUrl: `/login?url=${url}&${params}`, // Url that user will be redirect to when Person-icon is pressed and user is not logged in.
            initials,
            menuItems: [
              {
                name: intl.formatMessage({
                  id: 'userinfo',
                  defaultMessage: 'My information',
                }),
                url: `${config.URL.ROOTLINK}/omat-tiedot`,
                onClick: () => {},
              },
              {
                name: intl.formatMessage({
                  id: 'logout',
                  defaultMessage: 'Logout',
                }),
                url: '/logout',
                onClick: () => clearStorages(context),
              },
            ],
          },
        }
      : {};

  return (
    <LazilyLoad modules={modules}>
      {({ SiteHeader, SharedLocalStorageObserver }) => (
        <>
          <SharedLocalStorageObserver
            keys={['saved-searches', 'favouriteStore']}
            url={config.localStorageEmitter}
          />
          <SiteHeader
            hslFiUrl={config.URL.ROOTLINK}
            lang={lang}
            {...userMenu}
            languageMenu={languages}
            banners={banners}
            suggestionsApiUrl={config.URL.HSL_FI_SUGGESTIONS}
          />
        </>
      )}
    </LazilyLoad>
  );
};

AppBarHsl.contextTypes = {
  match: matchShape.isRequired,
  config: PropTypes.object.isRequired,
  getStore: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

AppBarHsl.propTypes = {
  lang: PropTypes.string,
  user: PropTypes.shape({
    given_name: PropTypes.string,
    family_name: PropTypes.string,
    sub: PropTypes.string,
    notLogged: PropTypes.bool,
  }),
};

AppBarHsl.defaultProps = {
  lang: 'fi',
  user: {},
};

export { AppBarHsl as default, AppBarHsl as Component };

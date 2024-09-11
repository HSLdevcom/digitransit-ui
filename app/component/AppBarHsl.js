/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { intlShape } from 'react-intl';
import { matchShape } from 'found';
import { Helmet } from 'react-helmet';
import { favouriteShape, configShape } from '../util/shapes';
import { clearOldSearches, clearFutureRoutes } from '../util/storeUtils';
import { getJson } from '../util/xhrPromise';

const SiteHeader = lazy(() => import('@hsl-fi/site-header'));
const SharedLocalStorageObserver = lazy(
  () => import('@hsl-fi/shared-local-storage'),
);

const clearStorages = context => {
  clearOldSearches(context);
  clearFutureRoutes(context);
  context.getStore('FavouriteStore').clearFavourites();
};

const notificationAPI = '/api/user/notifications';

const AppBarHsl = ({ lang, user, favourites }, context) => {
  const { config, match, intl } = context;
  const { location } = match;

  const notificationApiUrls = {
    get: `${notificationAPI}?language=${lang}`,
    post: `${notificationAPI}?language=${lang}`,
  };

  const [banners, setBanners] = useState([]);

  useEffect(() => {
    if (config.URL.BANNERS && config.NODE_ENV !== 'test') {
      getJson(`${config.URL.BANNERS}&language=${lang}`)
        .then(data => setBanners(data))
        .catch(() => setBanners([]));
    }
  }, [lang]);

  useEffect(() => {
    if (config.URL.FONTCOUNTER && config.NODE_ENV === 'production') {
      fetch(config.URL.FONTCOUNTER, {
        mode: 'no-cors',
      });
    }
  }, []);

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
            isAuthenticated: !!user.sub, // If user is authenticated, set `isAuthenticated`-property to true.
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

  const siteHeaderRef = useRef(null);
  const notificationTime = useRef(0);

  useEffect(() => {
    const now = Date.now();
    // refresh only once per 5 seconds
    if (now - notificationTime.current > 5000) {
      // Refetch notifications
      siteHeaderRef.current?.fetchNotifications();
      notificationTime.current = now;
    }
  }, [favourites]);

  return (
    <>
      {config.useCookiesPrompt && (
        <Helmet>
          <script
            id="CookieConsent"
            src="https://policy.app.cookieinformation.com/uc.js"
            data-gcm-version="2.0"
            data-culture={lang.toUpperCase()}
            type="text/javascript"
          />
        </Helmet>
      )}

      <Suspense fallback="">
        {!config.hideHeader && (
          <SiteHeader
            ref={siteHeaderRef}
            hslFiUrl={config.URL.ROOTLINK}
            lang={lang}
            {...userMenu}
            languageMenu={languages}
            banners={banners}
            suggestionsApiUrl={config.URL.HSL_FI_SUGGESTIONS}
            notificationApiUrls={notificationApiUrls}
          />
        )}
        {config.localStorageEmitter && (
          <SharedLocalStorageObserver
            keys={['saved-searches', 'favouriteStore']}
            url={config.localStorageEmitter}
          />
        )}
      </Suspense>
    </>
  );
};

AppBarHsl.contextTypes = {
  match: matchShape.isRequired,
  config: configShape.isRequired,
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
  favourites: PropTypes.arrayOf(favouriteShape),
};

AppBarHsl.defaultProps = {
  lang: 'fi',
  user: {},
  favourites: [],
};

export { AppBarHsl as default, AppBarHsl as Component };

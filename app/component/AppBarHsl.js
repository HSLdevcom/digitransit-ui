/* eslint-disable camelcase */
import '@hsl-fi/design-system-core/css/styles.css';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
import { intlShape } from 'react-intl';
import { matchShape } from 'found';
import { Helmet } from 'react-helmet';
import { SiteHeader, UserMenu } from '@hsl-fi/site-header';
import { favouriteShape, configShape } from '../util/shapes';
import { clearOldSearches, clearFutureRoutes } from '../util/storeUtils';
import { getJson } from '../util/xhrPromise';

const clearStorages = context => {
  clearOldSearches(context);
  clearFutureRoutes(context);
  context.getStore('FavouriteStore').clearFavourites();
};

const notificationAPI = '/api/user/notifications';

const AppBarHsl = ({ lang, user, favourites }, context) => {
  const { config, match } = context;
  const { location } = match;

  const notificationApiUrls = {
    get: `${notificationAPI}?language=${lang}`,
    post: `${notificationAPI}?language=${lang}`,
  };

  const [banners, setBanners] = useState([]);
  const [userNotifications, setUserNotifications] = useState({
    unreadCount: 0,
    loading: false,
    error: null,
    notifications: [],
    refetch: () => {},
    onOpen: () => {},
  });

  useEffect(() => {
    if (config.URL.BANNERS && process.env.NODE_ENV !== 'test') {
      getJson(`${config.URL.BANNERS}&language=${lang}`)
        .then(data => setBanners(data))
        .catch(() => setBanners([]));
    }
  }, [lang]);

  useEffect(() => {
    if (!user.sub) {
      return undefined;
    }

    const markAsRead = () => {
      fetch(notificationApiUrls.post, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
      })
        .then(() => {
          setUserNotifications(prev => ({ ...prev, unreadCount: 0 }));
        })
        .catch(() => {});
    };

    const fetchNotifications = () => {
      setUserNotifications(prev => ({ ...prev, loading: true, error: null }));
      getJson(notificationApiUrls.get)
        .then(data => {
          const raw = data || {};
          setUserNotifications({
            unreadCount: raw.unreadCount || 0,
            loading: false,
            error: null,
            notifications: (raw.notifications || []).map(n => ({
              ...n,
              link: n.link || {},
            })),
            refetch: fetchNotifications,
            onOpen: markAsRead,
          });
        })
        .catch(err => {
          setUserNotifications(prev => ({
            ...prev,
            loading: false,
            error: err,
          }));
        });
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user.sub, lang]);

  useEffect(() => {
    if (!user.sub) {
      return undefined;
    }

    const markAsRead = () => {
      fetch(notificationApiUrls.post, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
      })
        .then(() => {
          setUserNotifications(prev => ({ ...prev, unreadCount: 0 }));
        })
        .catch(() => {});
    };

    const fetchNotifications = () => {
      setUserNotifications(prev => ({ ...prev, loading: true, error: null }));
      getJson(notificationApiUrls.get)
        .then(data => {
          const raw = data || {};
          setUserNotifications({
            unreadCount: raw.unreadCount || 0,
            loading: false,
            error: null,
            notifications: (raw.notifications || []).map(n => ({
              ...n,
              link: n.link || {},
            })),
            refetch: fetchNotifications,
            onOpen: markAsRead,
          });
        })
        .catch(err => {
          setUserNotifications(prev => ({
            ...prev,
            loading: false,
            error: err,
          }));
        });
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user.sub, lang]);

  useEffect(() => {
    if (config.URL.FONTCOUNTER && process.env.NODE_ENV === 'production') {
      fetch(config.URL.FONTCOUNTER, {
        mode: 'no-cors',
      });
    }
  }, []);

  const languages = {
    fi: {
      href: `/fi${location.pathname}${location.search}`,
    },
    sv: {
      href: `/sv${location.pathname}${location.search}`,
    },
    en: {
      href: `/en${location.pathname}${location.search}`,
    },
  };

  const { given_name, family_name } = user;

  const url = encodeURI(location.pathname);
  const params = location.search && location.search.substring(1);
  const travelersAccountLink = config.URL.TRAVELERS_ACCOUNT
    ? { href: config.URL.TRAVELERS_ACCOUNT }
    : undefined;
  const myStopsAndRoutesLink = config.favouriteLink
    ? { href: config.favouriteLink[lang] || config.favouriteLink.fi }
    : undefined;
  const userMenu =
    config.allowLogin && (user.sub || user.notLogged) ? (
      <UserMenu
        lang={lang}
        loading={false}
        authenticated={!!user.sub}
        loginLink={{ href: `/login?url=${url}&${params}` }}
        logoutLink={{ href: '/logout', onClick: () => clearStorages(context) }}
        name={{ givenName: given_name, familyName: family_name }}
        userNotifications={userNotifications}
        travelersAccountLink={travelersAccountLink}
        myStopsAndRoutesLink={myStopsAndRoutesLink}
      />
    ) : null;

  const notificationTime = useRef(0);

  useEffect(() => {
    const now = Date.now();
    // refresh only once per 5 seconds
    if (now - notificationTime.current > 5000) {
      userNotifications.refetch();
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
      {!config.hideHeader && (
        <SiteHeader
          baseurl={config.URL.ROOTLINK}
          staticAssetsUrl={config.URL.STATIC_ASSETS}
          lang={lang}
          userMenu={userMenu}
          langMenu={languages}
          banners={banners}
          suggestionsApiUrl={config.URL.HSL_FI_SUGGESTIONS}
          notificationApiUrls={notificationApiUrls}
        />
      )}
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

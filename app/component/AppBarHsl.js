/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
import { matchShape } from 'found';
import { Helmet } from 'react-helmet';
import { SiteHeader, UserMenu, QuickSearch } from '@hsl-fi/site-header';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [searchHits, setSearchHits] = useState([]);
  const [searchHitsCount, setSearchHitsCount] = useState(0);
  const [userNotifications, setUserNotifications] = useState({
    unreadCount: 0,
    loading: false,
    error: null,
    notifications: [],
    refetch: () => {},
    onOpen: () => {},
  });

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
          setUserNotifications({
            unreadCount: data?.unreadCount || 0,
            loading: false,
            error: null,
            notifications: (data?.notifications || []).map(n => ({
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
    if (!searchQuery || !config.URL.HSL_FI_SUGGESTIONS) {
      setSearchHits([]);
      setSearchHitsCount(0);
      return undefined;
    }

    const timer = setTimeout(() => {
      setSearchLoading(true);
      setSearchError(false);
      getJson(
        `${
          config.URL.HSL_FI_SUGGESTIONS
        }?language=${lang}&take=5&query=${encodeURIComponent(searchQuery)}`,
      )
        .then(data => {
          const hits = (data?.hits || []).map(h => ({
            id: h.id,
            title: h.title,
            type: h.type,
            link: { href: h.url },
          }));
          setSearchHits(hits);
          setSearchHitsCount(
            data?.totalHits != null ? data.totalHits : hits.length,
          );
          setSearchLoading(false);
        })
        .catch(() => {
          setSearchError(true);
          setSearchLoading(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, lang]);

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

  const search = config.URL.HSL_FI_SUGGESTIONS ? (
    <QuickSearch
      searchPageLink={{ href: `${config.URL.ROOTLINK}/${lang}/haku` }}
      loading={searchLoading}
      error={searchError}
      query={searchQuery}
      onQueryChange={e => setSearchQuery(e.target.value)}
      hitsCount={searchHitsCount}
      hits={searchHits}
      lang={lang}
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
          baseUrl={config.URL.ROOTLINK}
          staticAssetsUrl={config.URL.STATIC_ASSETS}
          lang={lang}
          userMenu={userMenu}
          langMenu={languages}
          search={search}
        />
      )}
    </>
  );
};

AppBarHsl.contextTypes = {
  match: matchShape.isRequired,
  config: configShape.isRequired,
  getStore: PropTypes.func.isRequired,
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

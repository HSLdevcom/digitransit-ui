/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'found';
import { Helmet } from 'react-helmet';
import { SiteHeader, UserMenu, QuickSearch } from '@hsl-fi/site-header';
import { favouriteShape } from '../../utils/client/shapes';
import { clearFutureRoutes } from '../../utils/client/storeUtils';
import { clearOldSearches } from '../data/SearchHistory';
import { getJson } from '../../utils/shared/xhrPromise';
import {
  getFavouriteRouteGtfsIds,
  getFavouriteStopsAndStations,
} from '../data/FavouriteData';
import { useConfigContext } from '../hooks/ConfigContext';
import { getLoginPath, getLogoutPath } from '../../utils/shared/path';
import { createLanguageHref } from '../../utils/shared/languageUtils';
import { useFavouriteActions } from '../hooks/FavouriteContext';

const clearStorages = clearFavourites => {
  clearOldSearches();
  clearFutureRoutes();
  clearFavourites();
};

const notificationAPI = '/api/user/notifications';

export default function AppBarHsl({ favourites = [] }) {
  const config = useConfigContext();
  const { clearFavourites } = useFavouriteActions();
  const { user } = config;
  const { locale } = useIntl();
  const { router, match } = useRouter();
  const { location } = match;

  const notificationParams = new URLSearchParams({ language: locale });
  const notificationQuery = { language: locale };
  const routeIds = getFavouriteRouteGtfsIds(favourites);
  const stopIds = getFavouriteStopsAndStations(favourites).map(
    ({ gtfsId }) => gtfsId,
  );
  routeIds.forEach(id => notificationParams.append('route', id));
  stopIds.forEach(id => notificationParams.append('stop', id));
  if (routeIds.length) {
    notificationQuery.route = routeIds;
  }
  if (stopIds.length) {
    notificationQuery.stop = stopIds;
  }
  // the effect below runs once, so it reads the latest values via refs
  const notificationUrl = useRef();
  notificationUrl.current = `${notificationAPI}?${notificationParams}`;
  const notificationQueryRef = useRef();
  notificationQueryRef.current = notificationQuery;

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
      fetch(notificationUrl.current, {
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
      // getJson encodes the url, so params are passed separately to avoid double encoding
      getJson(notificationAPI, notificationQueryRef.current)
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
  }, [user.sub]);

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
        }?language=${locale}&take=5&query=${encodeURIComponent(searchQuery)}`,
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
  }, [searchQuery]);

  useEffect(() => {
    if (config.URL.FONTCOUNTER && process.env.NODE_ENV !== 'development') {
      fetch(config.URL.FONTCOUNTER, {
        mode: 'no-cors',
      });
    }
  }, []);

  const languages = {
    fi: { href: createLanguageHref(config, 'fi', location) },
    sv: { href: createLanguageHref(config, 'sv', location) },
    en: { href: createLanguageHref(config, 'en', location) },
  };

  const { given_name, family_name } = user;

  const returnTo = router.createHref(location);
  const travelersAccountLink = config.URL.TRAVELERS_ACCOUNT
    ? { href: config.URL.TRAVELERS_ACCOUNT }
    : undefined;
  const myStopsAndRoutesLink = config.favouriteLink
    ? { href: config.favouriteLink[locale] || config.favouriteLink.fi }
    : undefined;
  const userMenu =
    config.allowLogin && (user.sub || user.notLogged) ? (
      <UserMenu
        lang={locale}
        loading={false}
        authenticated={!!user.sub}
        loginLink={{ href: getLoginPath(returnTo) }}
        logoutLink={{
          href: getLogoutPath(returnTo),
          onClick: () => clearStorages(clearFavourites),
        }}
        name={{ givenName: given_name, familyName: family_name }}
        userNotifications={userNotifications}
        travelersAccountLink={travelersAccountLink}
        myStopsAndRoutesLink={myStopsAndRoutesLink}
      />
    ) : null;

  const search = config.URL.HSL_FI_SUGGESTIONS ? (
    <QuickSearch
      searchPageLink={{ href: `${config.URL.ROOTLINK}/${locale}/haku` }}
      loading={searchLoading}
      error={searchError}
      query={searchQuery}
      onQueryChange={e => setSearchQuery(e.target.value)}
      hitsCount={searchHitsCount}
      hits={searchHits}
      lang={locale}
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
            data-culture={locale.toUpperCase()}
            type="text/javascript"
          />
        </Helmet>
      )}
      {!config.hideHeader && (
        <SiteHeader
          baseUrl={config.URL.ROOTLINK}
          staticAssetsUrl={config.URL.STATIC_ASSETS}
          lang={locale}
          userMenu={userMenu}
          langMenu={languages}
          search={search}
          selectedMainNavSection="traveling"
        />
      )}
    </>
  );
}

AppBarHsl.propTypes = {
  favourites: PropTypes.arrayOf(favouriteShape),
};

export { AppBarHsl as Component };

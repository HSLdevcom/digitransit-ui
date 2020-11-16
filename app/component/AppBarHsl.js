/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import moment from 'moment';
import LazilyLoad, { importLazy } from './LazilyLoad';
import { clearOldSearches, clearFutureRoutes } from '../util/storeUtils';
import { replaceQueryParams } from '../util/queryUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { setLanguage } from '../action/userPreferencesActions';

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

const selectLanguage = (executeAction, lang, router, match) => () => {
  addAnalyticsEvent({
    category: 'Navigation',
    action: 'ChangeLanguage',
    name: lang,
  });
  executeAction(setLanguage, lang);
  if (lang !== 'en') {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(`moment/locale/${lang}`);
  }
  moment.locale(lang);
  replaceQueryParams(router, match, { locale: lang });
};

const AppBarHsl = ({ lang, user }, context) => {
  const { executeAction, config, router, match } = context;
  const { location } = match;

  const languages = [
    {
      name: 'fi',
      // onClick: selectLanguage(executeAction, 'fi', router, match),
      url: `/fi${location.pathname}${location.search}`,
    },
    {
      name: 'sv',
      // onClick: selectLanguage(executeAction, 'sv', router, match),
      url: `/sv${location.pathname}${location.search}`,
    },
    {
      name: 'en',
      // onClick: selectLanguage(executeAction, 'en', router, match),
      url: `/en${location.pathname}${location.search}`,
    },
  ];

  const { given_name, family_name } = user;

  const initials =
    given_name && family_name
      ? given_name.charAt(0) + family_name.charAt(0)
      : ''; // Authenticated user's initials, will be shown next to Person-icon.

  const url = encodeURI(`${location.pathname}${location.search}`);

  const userMenu =
    config.allowLogin && (initials.length > 0 || user.notLogged)
      ? {
          userMenu: {
            isLoading: false, // When fetching for login-information, `isLoading`-property can be set to true. Spinner will be shown.
            isAuthenticated: !!user.sub, // If user is authenticated, set `isAuthenticated`-property to true.
            loginUrl: `/login?url=${url}`, // Url that user will be redirect to when Person-icon is pressed and user is not logged in.
            initials,
            menuItems: [
              {
                name: 'Omat tiedot',
                url: `${config.URL.ROOTLINK}/omat-tiedot`,
                selected: false,
              },
              {
                name: 'Kirjaudu ulos',
                url: '/logout',
                selected: false,
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
            keys={['saved-searches', 'favouriteStore', 'futureRoutes']}
            url={config.localStorageEmitter}
          />
          <SiteHeader
            hslFiUrl={config.URL.ROOTLINK}
            {...userMenu}
            lang={lang}
            languageMenu={languages}
          />
        </>
      )}
    </LazilyLoad>
  );
};

AppBarHsl.contextTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  config: PropTypes.object.isRequired,
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
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

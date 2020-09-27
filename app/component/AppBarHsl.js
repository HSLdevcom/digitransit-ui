/* eslint-disable camelcase */
import PropTypes from 'prop-types';
import React from 'react';
import i18next from 'i18next';
import { isEmpty } from 'lodash';
import { matchShape, routerShape } from 'found';
import LazilyLoad, { importLazy } from './LazilyLoad';

const modules = {
  SiteHeader: () => importLazy(import('@hsl-fi/site-header')),
  SharedLocalStorageObserver: () =>
    importLazy(import('@hsl-fi/shared-local-storage')),
};

const initLanguage = language => {
  i18next.init({ lang: language, resources: {} });
  i18next.changeLanguage(language);
  if (language === 'fi') {
    i18next.addResourceBundle('fi', 'translation', {
      traveling_name: 'Matkustaminen',
      traveling_url: 'https://uusi.hsl.fi/matkustaminen',
      tickets_and_fares_name: 'Liput ja hinnat',
      tickets_and_fares_url: 'https://uusi.hsl.fi/liput-ja-hinnat',
      information_name: 'Asiakaspalvelu',
      information_url: 'https://uusi.hsl.fi/asiakaspalvelu',
      hsl_name: 'HSL',
      hsl_url: 'https://uusi.hsl.fi/hsl',
      search_url: 'https://uusi.hsl.fi/haku',
      change_language: 'Vaihda kieli',
    });
  }
  if (language === 'sv') {
    i18next.addResourceBundle('sv', 'translation', {
      traveling_name: 'Resor',
      traveling_url: 'https://uusi.hsl.fi/sv/tidtabeller-och-rutter',
      tickets_and_fares_name: 'Biljetter och priser',
      tickets_and_fares_url: 'https://uusi.hsl.fi/sv/biljetter-och-priser',
      information_name: 'Information',
      information_url: '/https://uusi.hsl.fi/sv/hjalp-och-info',
      hsl_name: 'HRT',
      hsl_url: 'https://uusi.hsl.fi/sv',
      search_url: '/https://uusi.hsl.fi/sv/search/solr',
      change_language: 'Välj språk',
    });
  }
  if (language === 'en') {
    i18next.addResourceBundle('en', 'translation', {
      traveling_name: 'Traveling',
      traveling_url: 'https://uusi.hsl.fi/en/timetables-and-routes',
      tickets_and_fares_name: 'Tickets and fares',
      tickets_and_fares_url: 'https://uusi.hsl.fi/en/tickets-and-fares',
      information_name: 'Information',
      information_url: 'https://uusi.hsl.fi/en/help-and-info',
      hsl_name: 'HSL',
      hsl_url: 'https://uusi.hsl.fi/en',
      search_url: 'https://uusi.hsl.fi/en/search/solr',
      change_language: 'Change language',
    });
  }
};

const AppBarHsl = ({ lang, user }, { match, config }) => {
  const { location } = match;

  initLanguage(lang);

  let startPageSuffix;
  switch (lang) {
    case 'en':
    case 'sv':
      startPageSuffix = `${lang}/`;
      break;
    case 'fi':
    default:
      startPageSuffix = '';
      break;
  }
  const navigation = {
    startPage: `https://uusi.hsl.fi/${startPageSuffix}`,
    menu: [
      {
        name: i18next.t('traveling_name'),
        url: i18next.t('traveling_url'),
        selected: false,
      },
      {
        name: i18next.t('tickets_and_fares_name'),
        url: i18next.t('tickets_and_fares_url'),
        selected: false,
      },
      {
        name: i18next.t('information_name'),
        url: i18next.t('information_url'),
        selected: false,
      },
      {
        name: i18next.t('hsl_name'),
        url: i18next.t('hsl_url'),
        selected: false,
      },
    ],
    searchPage: i18next.t('search_url'),
    languages: [
      {
        name: 'fi',
        url: `/fi${location.pathname}${location.search}`,
        selected: lang === 'fi',
      } /* ,
      {
        name: 'sv',
        url: `/sv${location.pathname}${location.search}`,
        selected: lang === 'sv',
      },
      {
        name: 'en',
        url: `/en${location.pathname}${location.search}`,
        selected: lang === 'en',
      }, */,
    ],
    breadcrumb: [],
  };
  const { startPage, menu, searchPage, languages } = navigation;
  const localizations = {
    mainNavigationLabel: 'main',
    changeLanguageButtonLabel: i18next.t('change_language'),
    changeToLanguageLinkLabelFunction: () => false,
  };
  const { given_name, family_name } = user;

  const initials =
    given_name && family_name
      ? given_name.charAt(0) + family_name.charAt(0)
      : undefined; // Authenticated user's initials, will be shown next to Person-icon.

  const userMenu = config.allowLogin
    ? {
        userMenu: {
          isLoading: false, // When fetching for login-information, `isLoading`-property can be set to true. Spinner will be shown.
          isAuthenticated: !isEmpty(user), // If user is authenticated, set `isAuthenticated`-property to true.
          loginUrl: '/login', // Url that user will be redirect to when Person-icon is pressed and user is not logged in.
          initials,
          menuItems: [
            {
              name: 'Omat tiedot',
              url: 'https://www.hsl.fi/omat-tiedot',
              selected: false,
            },
            {
              name: 'Kirjaudu ulos',
              url: '/logout',
              selected: false,
            },
          ], // Menu items that will be shown when Person-icon is pressed and user is authenticated,
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
            startPage={startPage}
            menu={menu}
            {...userMenu}
            searchPage={searchPage}
            languages={languages}
            localizations={localizations}
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
};

AppBarHsl.propTypes = {
  lang: PropTypes.string,
  user: PropTypes.shape({
    given_name: PropTypes.string,
    family_name: PropTypes.string,
  }),
};

AppBarHsl.defaultProps = {
  lang: 'fi',
  user: {},
};

export { AppBarHsl as default, AppBarHsl as Component };

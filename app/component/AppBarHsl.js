import PropTypes from 'prop-types';
import React from 'react';
import i18next from 'i18next';
import { matchShape, routerShape } from 'found';
import loadable from '@loadable/component';
import SharedLocalStorageObserver from '@hsl-fi/shared-local-storage';

const SiteHeader = loadable(() => import('@hsl-fi/site-header'), { ssr: true });

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

const AppBarHsl = ({ lang }, { match }) => {
  const { location } = match;

  initLanguage(lang);

  const navigation = {
    startPage: 'https://uusi.hsl.fi/',
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

  return (
    <>
      {/* This component should always be mounted */}
      <SharedLocalStorageObserver
        keys={['saved-searches', 'favouriteStore']}
        url="https://uusi.hsl.fi/local-storage-emitter"
      />
      <SiteHeader
        startPage={startPage}
        menu={menu}
        searchPage={searchPage}
        languages={languages}
        localizations={localizations}
      />
    </>
  );
};

AppBarHsl.contextTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  config: PropTypes.object.isRequired,
};

AppBarHsl.propTypes = {
  lang: PropTypes.string,
};

AppBarHsl.defaultProps = {
  lang: 'fi',
};

export { AppBarHsl as default, AppBarHsl as Component };

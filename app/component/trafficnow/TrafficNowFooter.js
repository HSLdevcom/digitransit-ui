import React from 'react';
import { SiteFooter } from '@hsl-fi/site-footer';
import { useConfigContext } from '../../configurations/ConfigContext';

const SUPPORTED_LANGS = ['fi', 'sv', 'en'];

const langPrefix = lang => (lang === 'fi' ? '' : `/${lang}`);

const href = (rootLink, lang, paths) =>
  `${rootLink}${langPrefix(lang)}${paths[lang]}`;

const buildFooterData = (rootLink, lang) => ({
  column1: {
    title: {
      fi: 'Liput ja hinnat',
      sv: 'Biljetter och priser',
      en: 'Tickets and fares',
    }[lang],
    links: [
      {
        label: {
          fi: 'Kausiliput',
          sv: 'Periodbiljetter',
          en: 'Season tickets',
        }[lang],
        href: href(rootLink, lang, {
          fi: '/liput-ja-hinnat/kausiliput',
          sv: '/biljetter-och-priser/periodbiljetter',
          en: '/tickets-and-fares/season-tickets',
        }),
      },
      {
        label: { fi: 'Kertaliput', sv: 'Enkelbiljetter', en: 'Single tickets' }[
          lang
        ],
        href: href(rootLink, lang, {
          fi: '/liput-ja-hinnat/kertaliput',
          sv: '/biljetter-och-priser/enkelbiljetter',
          en: '/tickets-and-fares/single-tickets',
        }),
      },
      {
        label: { fi: 'Vyöhykkeet', sv: 'Zoner', en: 'Zones' }[lang],
        href: href(rootLink, lang, {
          fi: '/liput-ja-hinnat/vyohykkeet',
          sv: '/biljetter-och-priser/zoner',
          en: '/tickets-and-fares/zones',
        }),
      },
    ],
  },
  column2: {
    title: { fi: 'Matkustaminen', sv: 'Att resa', en: 'Travelling' }[lang],
    links: [
      {
        label: {
          fi: 'Reitit ja aikataulut',
          sv: 'Rutter och tidtabeller',
          en: 'Routes and timetables',
        }[lang],
        href: href(rootLink, lang, {
          fi: '/reitit-ja-aikataulut',
          sv: '/rutter-och-tidtabeller',
          en: '/routes-and-timetables',
        }),
      },
      {
        label: {
          fi: 'Juhlapyhät ja poikkeusaikataulut',
          sv: 'Helger och avvikande tidtabeller',
          en: 'Bank holidays and changes',
        }[lang],
        href: href(rootLink, lang, {
          fi: '/matkustaminen/juhlapyhat-ja-poikkeusaikataulut',
          sv: '/att-resa/helger-och-avvikande-tidtabeller',
          en: '/travelling/bank-holidays-and-changes-to-public-transport-services',
        }),
      },
      {
        label: {
          fi: 'Esteettömyys',
          sv: 'Tillgänglighet',
          en: 'Accessibility',
        }[lang],
        href: href(rootLink, lang, {
          fi: '/matkustaminen/esteettomyys',
          sv: '/att-resa/tillganglighet',
          en: '/travelling/accessibility',
        }),
      },
    ],
  },
  column3: {
    title: { fi: 'HSL', sv: 'HRT', en: 'HSL' }[lang],
    links: [
      {
        label: {
          fi: 'Tietoa HSL:stä',
          sv: 'Information om HRT',
          en: 'About HSL',
        }[lang],
        href: href(rootLink, lang, {
          fi: '/hsl',
          sv: '/hrt',
          en: '/hsl',
        }),
      },
      {
        label: { fi: 'Uutiset', sv: 'Nyheter', en: 'News' }[lang],
        href: href(rootLink, lang, {
          fi: '/hsl/uutiset',
          sv: '/hrt/nyheter',
          en: '/hsl/news',
        }),
      },
      {
        label: { fi: 'Avoimet työpaikat', sv: 'Lediga jobb', en: 'Open jobs' }[
          lang
        ],
        href: href(rootLink, lang, {
          fi: '/hsl/avoimet-tyopaikat',
          sv: '/hrt/lediga-jobb',
          en: '/hsl/open-jobs',
        }),
      },
    ],
  },
  column4: {
    title: { fi: 'Asiakaspalvelu', sv: 'Kundtjänst', en: 'Customer service' }[
      lang
    ],
    links: [
      {
        label: { fi: 'Ota yhteyttä', sv: 'Kontakta oss', en: 'Contact us' }[
          lang
        ],
        href: href(rootLink, lang, {
          fi: '/asiakaspalvelu',
          sv: '/kundtjanst',
          en: '/customer-service',
        }),
      },
      {
        label: {
          fi: 'Anna palautetta',
          sv: 'Ge respons',
          en: 'Give feedback',
        }[lang],
        href: href(rootLink, lang, {
          fi: '/asiakaspalvelu/palaute',
          sv: '/kundtjanst/respons',
          en: '/customer-service/feedback',
        }),
      },
      {
        label: {
          fi: 'Löytötavarat',
          sv: 'Hittegods',
          en: 'Lost and found',
        }[lang],
        href: href(rootLink, lang, {
          fi: '/asiakaspalvelu/loytotavarat',
          sv: '/kundtjanst/hittegods',
          en: '/customer-service/lost-and-found',
        }),
      },
    ],
  },
  secondaryLinks: {
    contantInfoLink: {
      href: href(rootLink, lang, {
        fi: '/yhteystiedot',
        sv: '/kontaktuppgifter',
        en: '/contact-information',
      }),
    },
    paymentMethodsLink: {
      href: href(rootLink, lang, {
        fi: '/liput-ja-hinnat/maksutavat',
        sv: '/biljetter-och-priser/betalningssatt',
        en: '/tickets-and-fares/payment-methods',
      }),
    },
    privacyLink: {
      href: href(rootLink, lang, {
        fi: '/hsl/tietosuoja',
        sv: '/hrt/dataskydd',
        en: '/hsl/privacy-policy',
      }),
    },
    cookieSettingsLink: {
      href: href(rootLink, lang, {
        fi: '/hsl/tietosuoja',
        sv: '/hrt/dataskydd',
        en: '/hsl/privacy-policy',
      }),
    },
    termsOfUseLink: {
      href: href(rootLink, lang, {
        fi: '/kayttoehdot',
        sv: '/anvandarvillkor',
        en: '/terms-of-use',
      }),
    },
    accessibilityStatementLink: {
      href: href(rootLink, lang, {
        fi: '/saavutettavuusseloste',
        sv: '/tillganglighetsutlatande',
        en: '/accessibility-statement',
      }),
    },
  },
});

const TrafficNowFooter = () => {
  const {
    CONFIG,
    language,
    URL: { ROOTLINK },
  } = useConfigContext();

  if (CONFIG !== 'hsl') {
    return null;
  }

  const lang = SUPPORTED_LANGS.includes(language) ? language : 'fi';

  return (
    <SiteFooter
      baseUrl={ROOTLINK}
      lang={lang}
      data={buildFooterData(ROOTLINK, lang)}
      cookieSettingsButtonProps={{
        type: 'button',
        onClick: () => window.CookieConsent?.renew?.(),
      }}
      // variant="compact" // use the simple bottom bar footer without link columns and app promotion
    />
  );
};

export default TrafficNowFooter;

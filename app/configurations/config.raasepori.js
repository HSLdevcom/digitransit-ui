/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'raasepori';
const APP_TITLE = 'Bossen reittiopas';
const APP_DESCRIPTION =
  'Raaseporin reittiopas, Reittiopas Raasepori & Raseborgs reseplanerare, Reseplanerare Raseborg';

const walttiConfig = require('./config.waltti').default;

export default configMerger(walttiConfig, {
  CONFIG,

  feedIds: ['Raasepori', 'RaaseporiELY'],

  appBarLink: {
    name: 'Bosse',
    href: 'https://raasepori.fi/bosse',
    alternativeHref: {
      sv: 'https://raseborg.fi/bosse',
    },
  },

  colors: {
    primary: '#5B7B32',
    iconColors: {
      'mode-bus': '#5B7B32',
    },
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'raasepori/raasepori_logo_valkoinen.png',
  secondaryLogo: 'raasepori/raasepori_logo_musta.png',
  favicon: './app/configurations/images/raasepori/favicon.png',

  useSearchPolygon: true,

  areaPolygon: [
    [22.798050591810124, 60.02068257376368],
    [22.79960774361706, 59.897540949175465],
    [22.974192998046647, 59.86795098965149],
    [23.1058934795999, 59.93636651320679],
    [23.15420979372385, 59.90298885822057],
    [23.213956747462134, 59.9263269199696],
    [23.27525557012754, 59.91077003537629],
    [23.257409077452678, 59.86950901276791],
    [23.317931965654537, 59.82741676047499],
    [23.569334176961746, 59.80986220394601],
    [23.820736943339682, 59.94148746163248],
    [23.961957460163006, 60.134858929105945],
    [23.909193916601964, 60.22013915364576],
    [23.30008536226046, 60.19083699661951],
    [22.798050591810124, 60.02068257376368],
  ],

  defaultEndpoint: {
    address: 'Bockbodantie, Raasepori',
    lat: 60.03,
    lon: 23.57,
  },
  defaultMapZoom: 11,

  menu: {
    copyright: { label: `© Raasepori ${walttiConfig.YEAR}` },
    content: [
      {
        name: 'menu-feedback',
        href: {
          fi:
            'https://www.raasepori.fi/asuminen-ja-ymparisto/liikenne-ja-veneily/joukkoliikenteen-yhteystiedot/',
          sv:
            'https://www.raseborg.fi/boende-och-miljo/trafik-och-batliv/kollektivtrafikens-kontaktuppgifter/',
          en:
            'https://www.raseborg.fi/boende-och-miljo/trafik-och-batliv/kollektivtrafikens-kontaktuppgifter/',
        },
      },
      {
        name: 'about-this-service',
        route: '/tietoja-palvelusta',
      },
      {
        name: 'accessibility-statement',
        href: {
          fi: 'https://www.digitransit.fi/accessibility',
          sv: 'https://www.digitransit.fi/accessibility',
          en: 'https://www.digitransit.fi/en/accessibility',
        },
      },
    ],
  },

  vehicles: true,
  showVehiclesOnStopPage: true,
  showVehiclesOnSummaryPage: true,

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Raaseporin kaupunki valitsi v. 2022 Waltti lippu- ja maksujärjestelmän uudeksi joukkoliikenteen lippujärjestelmäksi ja 5.6.2023 tämä otettiin käyttöön, ensimmäisenä kaupunkina läntisellä Uudellamaalla. Uudistus näkyy mm. lipputuotteiden hinnoittelussa ja valikoimassa, maksuvaihtoehdoissa ja reittioppaassa.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'År 2022 valde Raseborgs stad biljett- och betalsystemet Waltti som nytt biljettsystem för kollektivtrafiken och den 5 juni 2023 togs detta i bruk, som den första staden i västra Nyland. Reformen kan ses i prissättning och urval av biljettprodukter, betalningsalternativ och reseplaneraren.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'In 2022, the city of Raseborg chose the Waltti ticket and payment system as the new public transport ticket system, and on June 5, 2023 this was put into use as the first city in western region of Nyland. The reform can be seen in the pricing and ticket products, payment options and the travelplanner.',
        ],
      },
    ],
  },
});

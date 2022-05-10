/* eslint-disable */
import configMerger from '../util/configMerger';

const CONFIG = 'walttiOpas';
const APP_TITLE = 'Waltti-opas';
const APP_DESCRIPTION = 'Uusi Reittiopas - Waltti-opas';

const walttiConfig = require('./config.waltti').default;

const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const OTP_URL = process.env.OTP_URL || `${API_URL}/routing/v2/routers/waltti-alt/`

export default configMerger(walttiConfig, {
  CONFIG,

  URL: {
    OTP: OTP_URL,
    STOP_MAP: `${OTP_URL}vectorTiles/stops,stations/`,
  },

  appBarLink: { name: 'Waltti', href: 'https://waltti.fi/' },

  colors: {
    primary: '#F16522',
    topBarColor: '#FFC439',
    iconColors: {
      'mode-bus': '#F16522',
    },
  },
  transportModes: {
    bus: {
      availableForSelection: true,
      defaultValue: true,
      nearYouLabel: {
        fi: 'Lähipysäkit kartalla',
        sv: 'Hållplatser på kartan',
        en: 'Nearby stops on map',
      },
    },
  },
  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'walttiOpas/waltti-logo.png',

  feedIds: ['Kotka', 'Kouvola', 'Salo'],

  defaultEndpoint: {
    address: 'Helsinki-Vantaan Lentoasema',
    lat: 60.317429,
    lon: 24.9690395,
  },

  menu: {
    copyright: { label: `© TVV lippu- ja maksujärjestelmä Oy ${walttiConfig.YEAR}` },
    content: [
      {
        name: 'about-this-service',
        route: '/tietoja-palvelusta',
      },
      {
        name: 'accessibility-statement',
        href:
          'https://kauppa.waltti.fi/media/authority/154/files/Saavutettavuusseloste_Waltti-reittiopas_JyQfJhC.htm',
      },
    ],
  },

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Waltti-reittiopas on TVV lippu- ja maksujärjestelmä Oy:n tarjoama kansallisen tason reittiopaspalvelu. Palvelu paikantaa sinulle sijainnin ja kertoo lähimmät linjat, pysäkit, reitit ja aikataulutiedot. Se suodattaa tarpeettoman tiedon ja kertoo, miten sujuvimmin pääset perille. Reittiopas-palvelu toimii kaikilla päätelaitteilla, mutta on tehty palvelemaan erityisen hyvin mobiilikäyttäjiä. Palvelu perustuu Digitransit-palvelualustaan.',
        ],
      },
      {
        header: 'Digitransit-palvelualusta',
        paragraphs: [
          'Digitransit-palvelualusta on HSL:n, TVV lippu- ja maksujärjestelmä Oy:n ja Traficomin kehittämä avoimen lähdekoodin reititystuote.',
        ],
      },
      {
        header: 'Tietolähteet',
        paragraphs: [
          'Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa © OpenStreetMap contributors. Osoitetiedot tuodaan Digi- ja väestötietoviraston rakennustietorekisteristä. Joukkoliikenteen reitit ja aikataulut ladataan Traficomin valtakunnallisesta joukkoliikenteen tietokannasta.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Waltti-rutguide är en nationell reseplanera som erbjuds av TVV lippu- ja maksujärjestelmä Oy. Tjänsten lokaliserar din plats och visar de närmsta linjerna och hållplatserna samt rutter och tidtabeller. Tjänsten filtrerar onödig information och anger hur du lättast kommer dit du ska. Ruttguidetjänsten fungerar på alla dataterminaler men är särskilt ägnad att betjäna dem som använder mobilenheter. Tjänsten är baserad på Digitransit, som är riksomfattande serviceplattform för reseplanerare.',
        ],
      },
      {
        header: 'Digitransit-plattformen',
        paragraphs: [
          'Digitransit-plattformen är en öppen programvara utvecklad av HRT, TVV lippu- ja maksujärjestelmä Oy och Traficom.',
        ],
      },
      {
        header: 'Datakällor',
        paragraphs: [
          'Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors. Addressinformation hämtas från BRC:s byggnadsinformationsregister. Kollektivtrafikens rutter och tidtabeller hämtas från Traficoms landsomfattande kollektivtrafiksdatabas.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'Waltti Journey planner is a national journey planner offered by TVV lippu- ja maksujärjestelmä Oy. The service finds your location and tells you the closest lines, stops, routes and timetables. It filters out unnecessary information and tells you the smoothest way to get to your destination. The Journey planner service works on all devices but is designed to best serve mobile users. Service is built on Digitransit platform.',
        ],
      },
      {
        header: 'Digitransit platform',
        paragraphs: [
          'The Digitransit service platform is an open source routing platform developed by HSL, TVV lippu- ja maksujärjestelmä Oy and Traficom.',
        ],
      },
      {
        header: 'Data sources',
        paragraphs: [
          'Maps, streets, buildings, stop locations etc. are provided by © OpenStreetMap contributors. Address data is retrieved from the Building and Dwelling Register of the Finnish Population Register Center. Public transport routes and timetables are downloaded from Traficom\'s national public transit database.',
        ],
      },
    ],
  },

  viaPointsEnabled: false,
  showVehiclesOnStopPage: true,
  showVehiclesOnSummaryPage: true,

  sourceForAlertsAndDisruptions: {
    Kotka: {
      fi: 'Kotkan seutu',
      sv: 'Kotkaregion',
      en: 'Kotka region',
    },
    Kouvola: {
      fi: 'Kouvola',
      sv: 'Kouvola',
      en: 'Kouvola',
    },
    Salo: {
      fi: 'Salo',
      sv: 'Salo',
      en: 'Salo',
    },
  },
});

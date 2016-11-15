const CONFIG = process.env.CONFIG || 'joensuu';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const APP_DESCRIPTION =
  'Reittiopas uudistuu. Tule mukaan! Ota uuden uuden sukupolven matkaopas käyttöösi.';

export default {
  CONFIG,

  URL: {
    OTP: `${API_URL}/routing/v1/routers/waltti/`,
    STOP_MAP: `${API_URL}/map/v1/waltti-stop-map/`,
  },

  title: 'Reittiopas',

  contactName: {
    sv: '',
    fi: '',
    default: '',
  },

  searchParams: {
    'boundary.rect.min_lat': 61.6,
    'boundary.rect.max_lat': 63.6,
    'boundary.rect.min_lon': 27.1,
    'boundary.rect.max_lon': 31,
  },

  availableLanguages: ['fi', 'sv', 'en'],

  initialLocation: {
    lat: 62.6024263,
    lon: 29.7569847,
  },

  cityBike: {
    showCityBikes: false,
  },

  stopsMinZoom: 14,

  appBarLink: { name: 'Joensuun kaupunki', href: 'http://www.joensuu.fi/' },

  colors: {
    primary: '#5c4696',
  },

  socialMedia: {
    title: 'Uusi Reittiopas - Joensuu',
    description: APP_DESCRIPTION,
  },

  meta: {
    description: APP_DESCRIPTION,
  },

  transportModes: {
    tram: {
      availableForSelection: false,
      defaultValue: false,
    },

    subway: {
      availableForSelection: false,
      defaultValue: false,
    },

    citybike: {
      availableForSelection: false,
    },

    airplane: {
      availableForSelection: false,
      defaultValue: false,
    },

    ferry: {
      availableForSelection: true,
      defaultValue: true,
    },
  },

  showModeFilter: false,

  areaPolygon: [[29.2154, 62.2692], [29.2154, 62.9964], [31.0931, 62.9964], [31.0931, 62.2692]],

  defaultEndpoint: {
    address: 'Keskusta, Joensuu',
    lat: 62.6024263,
    lon: 29.7569847,
  },

  /* eslint-disable max-len*/
  aboutThisService: {
    fi: {
      about: 'Tämä on Joensuun kaupungin testi uudeksi reittioppaaksi Joensuun alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan.',
      digitransit: 'Digitransit palvelualusta on HSL:n ja Liikenneviraston kehittämä avoimen lähdekoodin reititystuote. Lähdekoodi tarjotaan EUPL v1.2 ja AGPLv3 lisensseillä.',
      datasources: 'Kartat, kadut, rakennukset, pysäkkisijainnit ym. tiedot tarjoaa © OpenStreetMap contributors ja ne ladataan Geofabrik palvelusta. Osoitetiedot tuodaan VRK:n rakennustietorekisteristä ja ne ladataan OpenAddresses-palvelusta. Joukkoliikenteen reitit ja aikataulut ladataan HSL:n dev.hsl.fi/gtfs palvelimelta.',
    },

    sv: {
      about: 'This is a test service for Joensuu area route planning. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs.",
    },

    en: {
      about: 'This is a test service for Joensuu area route planning. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs.",
    },
  },
  /* eslint-enable max-len*/

};

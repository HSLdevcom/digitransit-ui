const CONFIG = process.env.CONFIG || 'turku';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const APP_DESCRIPTION =
  'Reittiopas uudistuu. Tule mukaan! Ota uuden uuden sukupolven matkaopas käyttöösi.';

export default {
  CONFIG,

  URL: {
    OTP: `${API_URL}/routing/v1/routers/waltti/`,
    STOP_MAP: `${API_URL}/map/v1/waltti-stop-map/`,
  },

  title: 'turku.digitransit.fi',
  useNavigationLogo: true,

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
    lat: 60.451159,
    lon: 22.267633,
  },

  cityBike: {
    showCityBikes: false,
  },

  stopsMinZoom: 14,

  colors: {
    primary: '#007ac9',
  },

  socialMedia: {
    title: 'Uusi Reittiopas - Turku',
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

  areaPolygon: [[21.81, 60.40], [21.81, 60.69], [22.80, 60.69], [22.80, 60.40]],

  defaultEndpoint: {
    address: 'Kauppatori, Turku',
    lat: 60.451159,
    lon: 22.267633,
  },

  /* eslint-disable max-len*/
  aboutThisService: {
    fi: {
      about: 'Tämä on Turun kaupungin testi uudeksi reittioppaaksi Turun alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan.',
      digitransit: 'Digitransit palvelualusta on HSL:n ja Liikenneviraston kehittämä avoimen lähdekoodin reititystuote. Lähdekoodi tarjotaan EUPL v1.2 ja AGPLv3 lisensseillä.',
      datasources: 'Kartat, kadut, rakennukset, pysäkkisijainnit ym. tiedot tarjoaa © OpenStreetMap contributors ja ne ladataan Geofabrik palvelusta. Osoitetiedot tuodaan VRK:n rakennustietorekisteristä ja ne ladataan OpenAddresses-palvelusta. Joukkoliikenteen reitit ja aikataulut ladataan HSL:n dev.hsl.fi/gtfs palvelimelta.',
    },

    sv: {
      about: 'This is a test service for Turku area route planning. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs.",
    },

    en: {
      about: 'This is a test service for Turku area route planning. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs.",
    },
  },

  staticMessages: [{
    id: 1,

    content: {
      fi: {
        title: 'Tämä on Fölin kehitysversio',
        content: 'Kokeile uusia ominaisuuksia ja lähetä meille palautetta. Päivitämme palvelua jatkuvasti. Lisätietoa projektista löydät osoitteesta digitransit.fi.',
      },

      sv: {
        title: 'Det här är utvecklingsversionen av Föli',
        content: 'Prova de nya egenskaperna och ge oss feedback. Vi uppdaterar tjänsten kontinuerligt. Mer information om projektet hittar du på addressen digitransit.fi.',
      },

      en: {
        title: 'This version of Föli is under development',
        content: 'Try the new features and send us feedback. We are updating the service constantly. More information about the project can be found at digitransit.fi.',
      },
    },
  }],

  /* eslint-enable max-len*/
  desktopWrapperText: `
    <h2>
      Reittiopas<sup>BETA</sup>
    </h2>
    <h1>Kokeile uutta Reittiopasta!</h1>
    Reittiopas uudistuu pian. Uusi Reittiopas tuo mukanaan liudan kauan
    kaivattuja parannuksia:
    <ul>
      <li>Reaaliaikatiedot kaikista liikennevälineistä</li>
      <li>Entistä parempi kartta</li>
      <li>Ennakoiva haku</li>
      <li>Näet lähialueesi lähdöt helposti</li>
    </ul>
    Uusi Reittiopas on suunniteltu erityisesti mobiililaitteet huomioiden, mutta se tulee toki
    toimimaan erinomaisesti myös tietokoneella. Voit tutustua jo nyt mobiilioptimoituun
    versioon. Valmista on loppuvuodesta 2016.
  `,
};

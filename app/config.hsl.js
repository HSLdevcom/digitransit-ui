const CONFIG = process.env.CONFIG || 'hsl';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const APP_DESCRIPTION =
  'HSL:n Reittiopas.fi uudistuu. Apuasi kaivataan kehitystyössä. ' +
  'Tule palvelun testaajaksi tai tee siitä saman tien parempi.';

export default {
  CONFIG,

  URL: {
    OTP: `${API_URL}/routing/v1/routers/hsl/`,
    STOP_MAP: `${API_URL}/map/v1/hsl-stop-map/`,
    CITYBIKE_MAP: `${API_URL}/map/v1/hsl-citybike-map/`,
    PARK_AND_RIDE_MAP: `${API_URL}/map/v1/hsl-parkandride-map/`,
    FONT: 'https://cloud.typography.com/6364294/6653152/css/fonts.css',
  },

  title: 'Reittiopas',

  contactName: {
    sv: 'HSR',
    fi: 'HSL',
    default: 'HSL',
  },

  preferredAgency: 'HSL',

  searchParams: {
    'boundary.rect.min_lat': 59.9,
    'boundary.rect.max_lat': 60.45,
    'boundary.rect.min_lon': 24.3,
    'boundary.rect.max_lon': 25.5,
  },

  nearbyRoutes: {
    radius: 2000,
    bucketSize: 100,
  },

  maxWalkDistance: 2500,
  availableLanguages: ['fi', 'sv', 'en'],

  parkAndRide: {
    showParkAndRide: true,
    parkAndRideMinZoom: 13,
  },

  stopsMinZoom: 14,

  colors: {
    primary: '#007ac9',
  },

  socialMedia: {
    title: 'Uusi Reittiopas',
    description: APP_DESCRIPTION,

    twitter: {
      site: '@hsldevcom',
    },
  },

  meta: {
    description: APP_DESCRIPTION,
  },

  showTicketInformation: true,

  transportModes: {
    airplane: {
      availableForSelection: false,
      defaultValue: false,
    },
  },

  areaPolygon: [
    [24.2647, 60.178], [24.3097, 60.2537], [24.3903, 60.3058], [24.4683, 60.3123],
    [24.4918, 60.3438], [24.5685, 60.3371], [24.6128, 60.3755], [24.739, 60.3642],
    [24.8046, 60.4071], [24.8684, 60.4192], [24.9694, 60.3508], [24.9992, 60.3524],
    [24.9865, 60.3732], [25.0452, 60.391], [25.0411, 60.4251], [25.1126, 60.4522],
    [25.162, 60.5238], [25.2438, 60.5168], [25.3261, 60.4666], [25.444, 60.3445],
    [25.5622, 60.2691], [25.4213, 60.1613], [25.3479, 59.9218], [24.94, 59.904],
    [24.5041, 59.801], [24.2785, 59.7737], [24.246, 59.791], [24.2367, 59.9579],
    [24.2579, 60.017], [24.3257, 60.0729], [24.2647, 60.178]],

  defaultEndpoint: {
    address: 'Rautatieasema, Helsinki',
    lat: 60.1710688,
    lon: 24.9414841,
  },

  /* eslint-disable max-len*/
  aboutThisService: {
    fi: {
      about: 'Tämän palvelun tarjoaa HSL joukkoliikenteen reittisuunnittelua varten Helsingin, Espoon, Vantaan, Kauniaisten, Keravan, Kirkkonummen ja Sipoon alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan.',
      digitransit: 'Digitransit palvelualusta on HSL:n ja Liikenneviraston kehittämä avoimen lähdekoodin reititystuote. Lähdekoodi tarjotaan EUPL v1.2 ja AGPLv3 lisensseillä.',
      datasources: 'Kartat, kadut, rakennukset, pysäkkisijainnit ym. tiedot tarjoaa © OpenStreetMap contributors ja ne ladataan Geofabrik palvelusta. Osoitetiedot tuodaan VRK:n rakennustietorekisteristä ja ne ladataan OpenAddresses-palvelusta. Joukkoliikenteen reitit ja aikataulut ladataan HSL:n dev.hsl.fi/gtfs palvelimelta.',
    },

    sv: {
      about: 'This service is provided by HSL for journey planning and information in the HSL region (Helsinki, Espoo, Vantaa, Kauniainen, Kerava, Kirkkonummi and Sipoo). The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs.",
    },

    en: {
      about: 'This service is provided by HSL for journey planning and information in the HSL region (Helsinki, Espoo, Vantaa, Kauniainen, Kerava, Kirkkonummi and Sipoo). The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs.",
    },
  },
  /* eslint-enable max-len*/

  /* eslint-disable max-len*/
  staticMessages: [{
    id: 1,

    content: {
      fi: {
        title: 'Tämä on Reittioppaan kehitysversio',
        content: 'Kuulut eliittiin! Käytät Reittioppaan kehitysversiota. Nauti uusista ominaisuuksista ja lähetä meille palautetta. Päivitämme palvelua jatkuvasti. Valmista on luvassa loppuvuodesta 2016. Lisätietoa projektista löydät osoitteesta digitransit.fi.',
      },

      sv: {
        title: 'Det här är reseplanerarens utvecklingsversion',
        content: 'Du tillhör eliten! Du använder utvecklingsversionen av reseplaneraren. Njut av de nya egenskaperna och ge oss feedback. Vi uppdaterar tjänsten kontinuerligt. Tjänsten kommer att stå färdig kring slutet av 2016. Mer information om projektet hittar du på addressen digitransit.fi.',
      },

      en: {
        title: 'This Journey Planner is still under development',
        content: 'You are one of the elite! You are using the development version of the Journey Planner. Enjoy the new features and send us feedback. We are updating the service constantly. Work is done by end of 2016. More information about the project can be found at digitransit.fi.',
      },
    },
  }],
  /* eslint-enable max-len*/

};

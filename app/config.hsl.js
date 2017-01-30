const CONFIG = process.env.CONFIG || 'hsl';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const APP_DESCRIPTION = 'Helsingin seudun liikenteen uusi Reittiopas.';

export default {
  CONFIG,

  URL: {
    OTP: `${API_URL}/routing/v1/routers/hsl/`,
    STOP_MAP: `${API_URL}/map/v1/hsl-stop-map/`,
    CITYBIKE_MAP: `${API_URL}/map/v1/hsl-citybike-map/`,
    PARK_AND_RIDE_MAP: `${API_URL}/map/v1/hsl-parkandride-map/`,
    TICKET_SALES_MAP: `${API_URL}/map/v1/hsl-ticket-sales-map/`,
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

  feedback: {
    // Enable feedback popup
    enable: true,
  },

  maxWalkDistance: 2500,
  availableLanguages: ['fi', 'sv', 'en'],
  defaultLanguage: 'fi',

  parkAndRide: {
    showParkAndRide: true,
    parkAndRideMinZoom: 14,
  },

  ticketSales: {
    showTicketSales: true,
    ticketSalesMinZoom: 16,
  },

  stopsMinZoom: 14,

  colors: {
    primary: '#007ac9',
  },

  appBarLink: { name: 'HSL.fi', href: 'https://www.hsl.fi/' },

  agency: {
    show: false,
  },

  socialMedia: {
    title: 'Uusi Reittiopas',
    description: APP_DESCRIPTION,

    image: {
      url: '/img/hsl-icons/social-share.png',
      width: 400,
      height: 400,
    },

    twitter: {
      card: 'summary',
      site: '@HSL_HRT',
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

  footer: {
    content: [
      { label: (function () { return `© HSL ${(1900 + new Date().getYear())}`; }()) },
      {},
      { name: 'footer-faq', nameEn: 'FAQ', href: 'https://www.hsl.fi/ohjeita-ja-tietoja/reittiopas' },
      { name: 'footer-feedback', nameEn: 'Send feedback', href: 'https://www.hsl.fi/palaute', icon: 'icon-icon_speech-bubble' },
      { name: 'about-this-service', nameEn: 'About this service', route: '/tietoja-palvelusta', icon: 'icon-icon_info' },
      { name: 'footer-link-to-privacy-policy', nameEn: 'Privacy policy', href: 'https://www.hsl.fi/tietoa-sivustosta' },
      { name: 'footer-link-to-old', nameEn: 'Use old Journey planner', href: 'http://www.reittiopas.fi/' },
    ],
  },

  defaultEndpoint: {
    address: 'Rautatieasema, Helsinki',
    lat: 60.1710688,
    lon: 24.9414841,
  },

  defaultOrigins: [
    { icon: 'icon-icon_rail', label: 'Rautatieasema, Helsinki', lat: 60.1710688, lon: 24.9414841 },
    { icon: 'icon-icon_airplane', label: 'Lentoasema, Vantaa', lat: 60.317429, lon: 24.9690395 },
    { icon: 'icon-icon_bus', label: 'Kampin bussiterminaali, Helsinki', lat: 60.16902, lon: 24.931702 },
  ],

  shouldShowIntro: true,

  aboutThisService: {
    fi: {
      about: 'Tervetuloa Reittioppaaseen! Reittiopas kertoo, miten pääset nopeasti ja helposti perille joukkoliikenteellä Helsingissä, Espoossa, Vantaalla, Kauniaisissa, Keravalla, Kirkkonummella ja Sipoossa. Reittiopas etsii nopeat reitit myös kävelyyn ja pyöräilyyn sekä rajatusti myös yksityisautoiluun. Reittiopas-palvelun tarjoaa HSL Helsingin seudun liikenne, ja se perustuu Digitransit-palvelualustaan.',
      digitransit: 'Digitransit-palvelualusta on HSL:n ja Liikenneviraston kehittämä avoimen lähdekoodin reititystuote. Lähdekoodi tarjotaan EUPL v1.2 ja AGPLv3 lisensseillä. Tule mukaan kehittämään palvelusta entistä parempi: digitransit.fi.',
      datasources: 'Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa © OpenStreetMap contributors, ja ne ladataan Geofabrik palvelusta. Osoitetiedot tuodaan Väestörekisterikeskuksen rakennustietorekisteristä, ja ne ladataan OpenAddresses-palvelusta. Joukkoliikenteen reitit ja aikataulut ladataan HSL:n dev.hsl.fi/gtfs palvelimelta.',
    },

    sv: {
      about: 'Den här tjänsten erbjuds av HRT för reseplanering inom huvudstadsregionen (Helsingfors, Esbo, Vanda, Grankulla, Kervo, Kyrkslätt och Sibbo). Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
      digitransit: 'Digitransit-plattformen är en öppen programvara utvecklad av HRT och Trafikverket. Källkoden distribueras under EUPL v1.2 och AGPLv3 licenserna. Du är välkommen att delta i utvecklandet av plattformen. Mer information hittar du på addressen digitransit.fi.',
      datasources: 'Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors och hämtas från Geofabrik-tjänsten. Addressinformation hämtas från BRC:s byggnadsinformationsregister och hämtas från OpenAddresses-tjänsten. Kollektivtrafikens rutter och tidtabeller hämtas från HRT:s egna tjänst dev.hsl.fi/gtfs.',
    },

    en: {
      about: 'This service is provided by HSL for journey planning and information in the HSL region (Helsinki, Espoo, Vantaa, Kauniainen, Kerava, Kirkkonummi and Sipoo). The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs.",
    },
  },

  staticMessages: [{
    id: 1,

    content: {
      fi: {
        title: 'Tervetuloa kokeilemaan uutta Reittiopasta!',
        content: 'Uusi Reittiopas auttaa löytämään sinulle läheisimmät joukkoliikennepalvelut. Voit antaa meille palautetta HSL:n palautelomakkeen kautta: https://www.hsl.fi/palaute',
      },

      sv: {
        title: 'Välkommen till den nya reseplaneraren!',
        content: 'Den nya reseplaneraren hjälper dig hitta de närmaste kollektivtrafikstjänsterna. Du kan ge oss feedback genom HRT:s responsformulär: https://www.hsl.fi/respons',
      },

      en: {
        title: 'Welcome to new Journey planner!',
        content: 'The new Journey planner will help you to find public transport nearby. You can send us feedback at https://www.hsl.fi/palaute',
      },
    },
  }],
};

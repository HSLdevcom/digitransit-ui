const CONFIG = process.env.CONFIG || 'default';
const API_URL = process.env.API_URL || 'https://dev-api.digitransit.fi';
const MAP_URL = process.env.MAP_URL || 'https://{s}-dev-api.digitransit.fi';
const APP_PATH = process.env.APP_CONTEXT || '';
const PIWIK_ADDRESS = process.env.PIWIK_ADDRESS || '';
const PIWIK_ID = process.env.PIWIK_ID || '';
const SENTRY_DSN = process.env.SENTRY_DSN || '';
const PORT = process.env.PORT || 8080;
const APP_DESCRIPTION =
  'Liikenneviraston Matka.fi uudistuu. Apuasi kaivataan kehitystyössä. ' +
  'Tule palvelun testaajaksi tai tee siitä saman tien parempi.';

export default {
  PIWIK_ADDRESS,
  PIWIK_ID,
  SENTRY_DSN,
  PORT,
  CONFIG,

  URL: {
    API_URL,
    OTP: `${API_URL}/routing/v1/routers/finland/`,
    MAP: `${MAP_URL}/map/v1/hsl-map/`,
    STOP_MAP: `${API_URL}/map/v1/finland-stop-map/`,
    CITYBIKE_MAP: `${API_URL}/map/v1/hsl-citybike-map/`,
    MQTT: 'wss://dev.hsl.fi/mqtt-proxy',
    ALERTS: `${API_URL}/realtime/service-alerts/v1`,
    FONT: 'https://fonts.googleapis.com/css?family=Lato:300,400,900%7CPT+Sans+Narrow:400,700',
    REALTIME: `${API_URL}/realtime/vehicle-positions/v1`,
    PELIAS: `${API_URL}/geocoding/v1/search`,
    PELIAS_REVERSE_GEOCODER: `${API_URL}/geocoding/v1/reverse`,
  },

  APP_PATH: `${APP_PATH}`,
  title: 'Matka.fi',
  useNavigationLogo: true,

  contactName: {
    sv: 'Livin',
    fi: 'Livin',
    default: "FTA's",
  },

  searchParams: {},

  search: {
    suggestions: {
      useTransportIcons: false,
    },
  },

  nearbyRoutes: {
    radius: 10000,
    bucketSize: 1000,
  },

  maxWalkDistance: 10000,
  maxBikingDistance: 100000,
  availableLanguages: ['fi', 'sv', 'en', 'fr', 'nb'],
  defaultLanguage: 'en',
  // This timezone data will expire on 31.12.2020
  timezoneData: 'Europe/Helsinki|EET EEST|-20 -30|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 ' +
    'WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|35e5',
  enableDesktopWrapper: true,

  mainMenu: {
    // Whether to show the left menu toggle button at all
    show: true,
    showDisruptions: true,
    showInquiry: true,
    showLoginCreateAccount: true,
    showOffCanvasList: true,
  },

  feedback: {
    // Whether to allow the feedback popup
    enable: true,
  },

  itinerary: {
    // How long vehicle should be late in order to mark it delayed. Measured in seconds.
    delayThreshold: 180,
    // Wait time to show "wait leg"? e.g. 180 means over 3 minutes are shown as wait time.
    // Measured in seconds.
    waitThreshold: 180,
    enableFeedback: false,

    timeNavigation: {
      enableButtonArrows: false,
    },
  },

  initialLocation: {
    zoom: 11,
    lat: 60.17332,
    lon: 24.94102,
  },

  nearestStopDistance: {
    maxShownDistance: 5000,
  },

  map: {
    useRetinaTiles: true,
    tileSize: 512,
    zoomOffset: -1,
    useVectorTiles: true,

    genericMarker: {
      // Do not render name markers at zoom levels below this value
      nameMarkerMinZoom: 18,

      popup: {
        offset: [106, 16],
        maxWidth: 250,
        minWidth: 250,
      },
    },

    line: {
      halo: {
        weight: 7,
        thinWeight: 4,
      },

      leg: {
        weight: 5,
        thinWeight: 2,
      },
    },

    useModeIconsInNonTileLayer: false,
  },

  stopCard: {
    header: {
      showDescription: true,
      showStopCode: true,
      showDistance: true,
    },
  },

  autoSuggest: {
    // Let Pelias suggest based on current user location
    locationAware: true,
  },

  cityBike: {
    showCityBikes: true,

    useUrl: {
      fi: 'https://www.hsl.fi/citybike',
      sv: 'https://www.hsl.fi/sv/citybike',
      en: 'https://www.hsl.fi/en/citybike',
    },

    infoUrl: {
      fi: 'https://www.hsl.fi/kaupunkipyörät',
      sv: 'https://www.hsl.fi/sv/stadscyklar',
      en: 'https://www.hsl.fi/en/citybikes',
    },

    cityBikeMinZoom: 14,
    cityBikeSmallIconZoom: 14,
    // When should bikeshare availability be rendered in orange rather than green
    fewAvailableCount: 3,
  },
  // Lowest level for stops and terminals are rendered
  stopsMinZoom: 13,
  // Highest level when stops and terminals are still rendered as small markers
  stopsSmallMaxZoom: 14,
  // Highest level when terminals are still rendered instead of individual stops
  terminalStopsMaxZoom: 17,
  terminalStopsMinZoom: 12,
  terminalNamesZoom: 16,


  logo: '/img/matka-logo.png',

  colors: {
    primary: '#00AFFF',
  },

  disruption: {
    showInfoButton: true,
  },

  socialMedia: {
    title: 'Uusi Matka.fi',
    description: APP_DESCRIPTION,
    locale: 'fi_FI',

    twitter: {
      site: '@hsldevcom',
    },
  },

  meta: {
    description: APP_DESCRIPTION,
    keywords: 'reitti,reitit,opas,reittiopas,joukkoliikenne',
  },
  // Ticket information feature toggle
  showTicketInformation: false,
  showRouteInformation: false,

  // Control what transport modes that should be possible to select in the UI
  // and whether the transport mode is used in trip planning by default.
  transportModes: {
    bus: {
      availableForSelection: true,
      defaultValue: true,
    },

    tram: {
      availableForSelection: true,
      defaultValue: true,
    },

    rail: {
      availableForSelection: true,
      defaultValue: true,
    },

    subway: {
      availableForSelection: true,
      defaultValue: true,
    },

    citybike: {
      availableForSelection: true,
      defaultValue: false,
    },

    airplane: {
      availableForSelection: true,
      defaultValue: true,
    },

    ferry: {
      availableForSelection: true,
      defaultValue: true,
    },
  },

  showModeFilter: true,

  moment: {
    relativeTimeThreshold: {
      seconds: 55,
      minutes: 59,
      hours: 23,
      days: 26,
      months: 11,
    },
  },

  customizeSearch: {
    walkReluctance: {
      available: true,
    },

    walkBoardCost: {
      available: true,
    },

    transferMargin: {
      available: true,
    },

    walkingSpeed: {
      available: true,
    },

    ticketOptions: {
      available: true,
    },

    accessibility: {
      available: true,
    },
  },

  areaPolygon: [
    [18.776, 60.3316],
    [18.9625, 60.7385],
    [19.8615, 60.8957],
    [20.4145, 61.1942],
    [20.4349, 61.9592],
    [19.7853, 63.2157],
    [20.4727, 63.6319],
    [21.6353, 63.8559],
    [23.4626, 64.7794],
    [23.7244, 65.3008],
    [23.6873, 65.8569],
    [23.2069, 66.2701],
    [23.4627, 66.8344],
    [22.9291, 67.4662],
    [23.0459, 67.9229],
    [20.5459, 68.7605],
    [20.0996, 69.14],
    [21.426, 69.4835],
    [21.9928, 69.4009],
    [22.9226, 68.8678],
    [23.8108, 69.0145],
    [24.6903, 68.8614],
    [25.2262, 69.0596],
    [25.4029, 69.7235],
    [26.066, 70.0559],
    [28.2123, 70.2496],
    [29.5813, 69.7854],
    [29.8467, 69.49],
    [28.9502, 68.515],
    [30.4855, 67.6952],
    [29.4962, 66.9232],
    [30.5219, 65.8728],
    [30.1543, 64.9646],
    [30.9641, 64.1321],
    [30.572, 63.7098],
    [31.5491, 63.3309],
    [31.9773, 62.9304],
    [31.576, 62.426],
    [27.739, 60.1117],
    [26.0945, 59.8015],
    [22.4235, 59.3342],
    [20.2983, 59.2763],
    [19.3719, 59.6858],
    [18.7454, 60.1305],
    [18.776, 60.3316],
  ],

  // Default origin endpoint to use when user is outside of area
  defaultEndpoint: {
    address: 'Helsinki-Vantaan Lentoasema',
    lat: 60.317429,
    lon: 24.9690395,
  },

  /* eslint-disable max-len*/
  aboutThisService: {
    fi: {
      about: 'Tämän palvelun tarjoaa Liikennevirasto joukkoliikenteen reittisuunnittelua varten koko Suomen alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan.',
      digitransit: 'Digitransit palvelualusta on HSL:n ja Liikenneviraston kehittämä avoimen lähdekoodin ratkaisu, jonka taustalla toimii mm. OpenTripPlanner. Lähdekoodi tarjotaan EUPL v1.2 ja AGPLv3 lisensseillä.',
      datasources: 'Kartat, kadut, rakennukset, pysäkkisijainnit ym. tiedot tarjoaa © OpenStreetMap contributors ja ne ladataan Geofabrik palvelusta. Osoitetiedot tuodaan VRK:n rakennustietorekisteristä ja ne ladataan OpenAddresses-palvelusta. Joukkoliikenteen reitit ja aikataulut ladataan mm. Liikenneviraston valtakunnallisesta joukkoliikenteen tietokannasta.',
    },

    sv: {
      about: 'Den här tjänsten erbjuds av Trafikverket för reseplanering inom hela Finland. Reseplaneraren täcker med vissa begränsningar kollektivtrafik, promenad, cykling samt privatbilism. Tjänsten baserar sig på Digitransit-plattformen.',
      digitransit: 'Digitransit-plattformen är en öppen programvara utvecklad av HRT och Trafikverket, som bl.a. stödjer sig på OpenTripPlanner. Källkoden distribueras under EUPL v1.2 och AGPLv3 licenserna.',
      datasources: 'Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors och laddas ned från Geofabrik-tjänsten. Addressinformation hämtas från BRC:s byggnadsinformationsregister och laddas ned från OpenAddresses-tjänsten. Kollektivtrafikens rutter och tidtabeller hämtas bl.a. från Trafikverkets landsomfattande kollektivtrafiksdatabas.',
    },

    en: {
      about: 'This service is provided by Finnish Transport Agency for journey planning and information in Finland. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL and Finnish Transport Agency, built on top of e.g. OpenTripPlanner. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from Finnish Transport Agency's national public transit database.",
    },

    nb: {},
    fr: {},
  },
  /* eslint-enable max-len*/

  /* eslint-disable max-len*/
  staticMessages: [{
    id: 1,

    content: {
      fi: {
        title: 'Tämä on Matka.fi:n kehitysversio',
        content: 'Käytät Matka.fi-palvelun kehitysversiota. Kokeile uusia ominaisuuksia ja lähetä meille palautetta. Päivitämme palvelua jatkuvasti. Lisätietoa projektista löydät osoitteesta digitransit.fi.',
      },

      sv: {
        title: 'Det här är utvecklingsversionen av Resa.fi',
        content: 'Du använder utvecklingsversionen av Resa.fi. Prova de nya egenskaperna och ge oss feedback. Vi uppdaterar tjänsten kontinuerligt. Mer information om projektet hittar du på addressen digitransit.fi.',
      },

      en: {
        title: 'This version of Journey.fi is under development',
        content: 'You are using the development version of Journey.fi. Try the new features and send us feedback. We are updating the service constantly. More information about the project can be found at digitransit.fi.',
      },
    },
  }],
  /* eslint-enable max-len*/

  /* eslint-disable max-len*/
  desktopWrapperText: `
    <h2>
      <svg
        viewBox="0 0 280 280"
        height="50px"
        width="50px"
        style="vertical-align: bottom; margin-right: 5"
      >
        <polygon fill="#999"
          points="42.512,71.087 42.512,12.741 31.075,12.741 31.075,80.951 67.803,80.951 67.803,71.087"/>
        <polygon fill="#999" points="73.051,28.482 83.545,28.482 83.545,80.951 73.051,80.951"/>
        <polygon fill="#999" points="157.947,154.408 168.439,154.408 168.439,206.878 157.947,206.878"/>
        <polygon fill="#999" points="94.038,28.482 104.532,28.482 104.532,80.951 94.038,80.951"/>
        <polygon fill="#999" points="162.247,28.482 149.656,28.482 132.026,49.679 125.519,49.679 125.519,12.741 115.025,12.741
          115.025,80.95 125.519,80.95 125.519,58.599 131.817,58.599 149.13,80.95 162.247,80.95 140.631,53.982"/>
        <path fill="#999" d="M70.635,131.952c0,0-5.876,3.882-15.111,3.882c-8.5,0-16.265-4.617-16.265-12.907h42.29
          c0.212-1.679,0.316-3.358,0.316-5.246c0-20.989-11.753-27.285-26.864-27.285c-15.112,0-26.655,6.296-26.655,27.285
          c0,20.986,12.068,27.283,27.178,27.283c13.328,0,19.414-5.248,19.414-5.248L70.635,131.952L70.635,131.952z M55.001,99.525
          c9.024,0,16.159,3.988,16.159,14.482H39.05C39.05,103.723,45.976,99.525,55.001,99.525L55.001,99.525z"/>
        <path fill="#999" d="M242.212,131.952c0,0-5.877,3.882-15.111,3.882c-8.501,0-16.267-4.617-16.267-12.907h42.292
          c0.208-1.679,0.315-3.358,0.315-5.246c0-20.989-11.754-27.285-26.867-27.285c-15.109,0-26.652,6.296-26.652,27.285
          c0,20.986,12.066,27.283,27.179,27.283c13.326,0,19.412-5.248,19.412-5.248L242.212,131.952L242.212,131.952z M226.574,99.525
          c9.026,0,16.162,3.988,16.162,14.482h-32.112C210.624,103.723,217.551,99.525,226.574,99.525L226.574,99.525z"/>
        <path fill="#999" d="M135.907,143.913v-36.098c0-9.34-2.834-17.42-19.728-17.42c-10.81,0-17,5.352-17,5.352l-1.155-4.303h-9.34
          v52.469H99.18v-36.728c0,0,3.882-7.135,14.271-7.135c7.136,0,11.963,1.889,11.963,9.969v33.894L135.907,143.913L135.907,143.913z"
          />
        <path fill="#999" d="M193.098,143.913v-36.098c0-9.34-2.832-17.42-19.726-17.42c-10.81,0-17.001,5.352-17.001,5.352
          l-1.155-4.303h-9.337v52.469h10.493v-36.728c0,0,3.884-7.135,14.272-7.135c7.135,0,11.962,1.889,11.962,9.969v33.894
          L193.098,143.913L193.098,143.913z"/>
        <polygon fill="#999" points="142.1,154.408 126.569,198.167 126.253,198.167 110.827,154.408 99.18,154.408 118.069,206.878
          134.754,206.878 153.748,154.408     "/>
        <path fill="#999" d="M205.167,153.359c-11.229,0-15.74,6.401-15.74,6.401l-1.153-5.352h-9.342v52.47h10.495v-34.526
          c0,0,2.519-8.815,15.74-8.815V153.359L205.167,153.359z"/>
        <path fill="#999" d="M241.897,192.92c0,0-5.562,5.353-16.581,5.353c-7.449,0-9.654-3.883-9.654-8.187
          c0-4.407,2.204-6.61,9.654-6.61c10.18,0,16.581,2.414,16.581,2.414V192.92z M252.391,198.166v-27.387
          c0-15.953-10.494-17.421-22.143-17.421c-12.592,0-21.722,4.826-21.722,4.826l5.561,8.29c0,0,5.877-3.463,15.218-3.463
          c8.815,0,12.592,2.415,12.592,9.971v4.092c0,0-5.458-2.414-18.574-2.414c-13.012,0-18.155,6.401-18.155,15.845
          c0,9.341,5.142,17.422,18.679,17.422c9.97,0,18.576-5.667,18.576-5.667l1.678,4.617h11.018L252.391,198.166L252.391,198.166z"/>
        <path fill="#999" d="M105.266,238.359c14.168,0,21.303,6.087,21.303,16.579c0,10.495-8.081,15.953-23.821,15.953
          c-13.643,0-22.669-6.298-22.669-6.298l6.087-7.661c0,0,7.662,4.618,16.582,4.618c7.869,0,13.327-1.364,13.327-6.613
          c0-5.246-4.513-7.134-13.746-7.134c-14.377,0-21.829-4.934-21.829-15.426c0-10.493,7.452-16.056,23.193-16.056
          c14.479,0,22.14,6.296,22.14,6.296l-6.086,7.452c0,0-5.562-4.409-15.531-4.409c-8.396,0-13.222,1.469-13.222,6.718
          C90.995,237.624,95.821,238.359,105.266,238.359L105.266,238.359z"/>
        <path fill="#999" d="M152.907,261.34c-4.407,0-5.35-1.26-5.35-7.87v-25.921h16.789V218h-16.789v-9.339h-7.032L136.538,218
          h-7.871v9.549h8.396v28.124c0,12.279,2.834,15.218,13.328,15.218c6.296,0,15.531-1.891,15.531-1.891l-1.154-9.025
          C164.767,259.975,158.26,261.34,152.907,261.34L152.907,261.34z"/>
        <path fill="#999" d="M194.149,261.236c-9.865,0-16.685-4.618-16.685-18.05c0-13.431,6.82-17.21,16.685-17.21
          c9.865,0,16.895,3.779,16.895,17.21C211.044,256.617,204.014,261.236,194.149,261.236z M194.149,216.322
          c-15.112,0-27.18,5.877-27.18,26.864c0,20.988,12.068,27.706,27.18,27.706c15.112,0,27.389-6.718,27.389-27.706
          C221.538,222.198,209.262,216.322,194.149,216.322L194.149,216.322z"/>
      </svg>
      Matka.fi<sup>BETA</sup>
    </h2>
    <h1>Kokeile uudistuvaa Matka.fi-palvelua!</h1>
    <p>
      Uusi palvelu on suunniteltu erityisesti mobiililaitteet huomioiden, mutta se tulee toki
      toimimaan erinomaisesti myös tietokoneella. Voit tutustua jo nyt mobiilioptimoituun
      versioon. Valmista on loppuvuodesta 2016.
    </p>
    <p>
      Uusia ominaisuuksia muun muassa:
    </p>
    <ul>
      <li>Lähialueen lähdöt</li>
      <li>Omat suosikit</li>
      <li>Parempi kartta</li>
      <li>Reaaliaikatietoa, jos saatavilla</li>
    </ul>
  `,
  /* eslint-enable max-len*/
};

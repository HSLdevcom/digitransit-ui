import configMerger from '../util/configMerger';

const CONFIG = 'turku';
const APP_TITLE = 'Fölin reittiopas';
const APP_DESCRIPTION =
  'Fölin reittiopas uudistuu. Tule mukaan! Ota uuden uuden sukupolven matkaopas käyttöösi.';

const walttiConfig = require('./waltti').default;

export default configMerger(walttiConfig, {
  CONFIG,

  feedIds: ['FOLI'],

  searchParams: {
    'boundary.rect.min_lat': 59.963388,
    'boundary.rect.max_lat': 60.950777,
    'boundary.rect.min_lon': 21.145557,
    'boundary.rect.max_lon': 22.939795,
  },

  colors: {
    primary: '#e8aa27',
  },

  appBarLink: { name: 'Föli', href: 'http://www.foli.fi/fi' },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,

    twitter: {
      site: '@Turkukaupunki',
    },
  },

  meta: {
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  transportModes: {
    ferry: {
      availableForSelection: true,
      defaultValue: true,
    },
  },

  areaPolygon: [
    [21.145557, 59.963388],
    [21.145557, 60.950777],
    [22.939795, 60.950777],
    [22.939795, 59.963388],
  ],

  footer: {
    content: [
      { label: (function () { return `© Turun seudun joukkoliikenne ${(1900 + new Date().getYear())}`; }()) },
      {},
      { name: 'about-this-service', nameEn: 'About this service', route: '/tietoja-palvelusta', icon: 'icon-icon_info' },
    ],
  },

  defaultEndpoint: {
    address: 'Kauppatori, Turku',
    lat: 60.451159,
    lon: 22.267633,
  },

  defaultOrigins: [
    { icon: 'icon-icon_bus', label: 'Kauppatori, Turku', lat: 60.451159, lon: 22.267633 },
    { icon: 'icon-icon_rail', label: 'Rautatieasema, Turku', lat: 60.453537, lon: 22.253379 },
    { icon: 'icon-icon_airplane', label: 'Lentoasema, Turku', lat: 60.511092, lon: 22.274211 },
  ],

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: ['Kuuden kunnan yhdessä järjestämä joukkoliikenne Turun seudulla alkoi 1.7.2014. Turun seudun joukkoliikenteessä eli Fölissä ovat mukana Turku, Kaarina, Raisio, Naantali, Lieto ja Rusko. Seudullisen joukkoliikenteen alkamisen myötä joukkoliikenteen käyttö on helppoa ja edullista riippumatta kuntarajoista.'],
      },
      {
        header: 'Tietolähteet',
        paragraphs: ['Kartat, tiedot kaduista, rakennuksista, pysäkkien sijainnista ynnä muusta tarjoaa © OpenStreetMap contributors. Osoitetiedot tuodaan Väestörekisterikeskuksen rakennustietorekisteristä. Joukkoliikenteen reitit ja aikataulut perustuvat Fölin tuottamaan GTFS-aineistoon.'],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: ['Kollektivtrafiken i Åboregionen inleds den 1 juli 2014 och ordnas samfällt av sex kommuner. Åbo, S:t Karins, Reso, Nådendal, Lundo och Rusko deltar i Föli, dvs. kollektivtrafiken i Åboregionen. När den regionala kollektivtrafiken startar blir det lätt och förmånligt att använda kollektivtrafiken i regionen kring Åbo stad oberoende av kommungränserna.'],
      },
      {
        header: 'Datakällor',
        paragraphs: ['Kartor, gator, byggnader, hållplatser och dylik information erbjuds av © OpenStreetMap contributors. Addressinformation hämtas från BRC:s byggnadsinformationsregister. Kollektivtrafikens rutter och tidtabeller är baserad på Fölis GTFS data.'],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: ['Public transport organised jointly between six municipalities in the Turku region will start on 1 July 2014. Turku region public transport, under the name of Föli, is a collaboration between Turku, Kaarina, Raisio, Naantali, Lieto, and Rusko. With regional public transport, using the public transport system in Turku city region will be easy and inexpensive, regardless of municipal borders. Public transport service points will be introduced in each of the six municipalities. You can use any of the service points.'],
      },
      {
        header: 'Data sources',
        paragraphs: ['Maps, streets, buildings, stop locations etc. are provided by © OpenStreetMap contributors. Address data is retrieved from the Building and Dwelling Register of the Finnish Population Register Center. Public transport routes and timetables are based on GTFS data produced by Föli.'],
      },
    ],
  },

  staticMessages: [],

});

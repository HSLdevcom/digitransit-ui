/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'jyvaskyla';
const APP_TITLE = 'Reittiopas Jyväskylä';
const APP_DESCRIPTION = 'Jyväskylän uusi reittiopas';

const walttiConfig = require('./waltti').default;

const minLat = 61.835318;
const maxLat = 62.603473;
const minLon = 25.230388;
const maxLon = 26.358237;

export default configMerger(walttiConfig, {
  CONFIG,

  feedIds: ['KeskiSuomenEly', 'LINKKI'],

  searchParams: {
    'boundary.rect.min_lat': minLat,
    'boundary.rect.max_lat': maxLat,
    'boundary.rect.min_lon': minLon,
    'boundary.rect.max_lon': maxLon,
  },

  areaPolygon: [
    [minLon, minLat],
    [minLon, maxLat],
    [maxLon, maxLat],
    [maxLon, minLat],
  ],

  defaultEndpoint: {
    address: 'Jyväskylän paikallisliikenneterminaali',
    lat: 62.241015674,
    lon: 25.7485345616,
  },

  defaultOrigins: [
    {
      icon: 'icon-icon_bus',
      label: 'Paikallisliikenneterminaali, Jyväskylä',
      lat: 62.2410157,
      lon: 25.7485346,
    },
    {
      icon: 'icon-icon_bus',
      label: 'Kauppatori, Jyväskylä',
      lat: 62.244958,
      lon: 25.746471,
    },
    {
      icon: 'icon-icon_bus',
      label: 'Keski-Suomen keskussairaala, Jyväskylä',
      lat: 62.229935,
      lon: 25.710604,
    },
  ],

  appBarLink: {
    name: 'Jyväskylän seudun joukkoliikenne',
    href: 'http://linkki.jyvaskyla.fi/',
  },

  colors: {
    primary: '#7DC02D',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  // Navbar logo
  logo: 'jyvaskyla/favicon.png',

  mapLayers: {
    tooltip: {
      fi: 'Uutta! Saat nyt lähellä olevat bussit kartalle asetuksista.',
      en: 'New! You can now get nearby busses on the map from the settings.',
      sv:
        'Nytt! I inställningarna kan du nu välja att se närliggande bussar på kartan.',
    },
  },

  textLogo: false,

  showAllBusses: true,
  showVehiclesOnStopPage: true,

  footer: {
    content: [
      { label: `© Jyvaskyla ${walttiConfig.YEAR}` },
      {},
      {
        name: 'footer-feedback',
        nameEn: 'Submit feedback',
        href: 'https://s-asiointi.jkl.fi/eFeedback/fi/Feedback/38',
        icon: 'icon-icon_speech-bubble',
      },
      {
        name: 'about-this-service',
        nameEn: 'About this service',
        route: '/tietoja-palvelusta',
        icon: 'icon-icon_info',
      },
    ],
  },

  aboutThisService: {
    fi: [
      {
        header: 'Tietoja palvelusta',
        paragraphs: [
          'Tämä palvelu on tarkoitettu helpottamaan suunnittelua, kun teet matkoja Jyväskylän, Laukaan ja Muuramen alueella. Esitetyt joukkoliikenteen aikataulut ja reitit perustuvat Linkki-paikallisliikenteen osalta voimassa olevaan aikatauludataan. Seutuliikenteen aikataulu- ja reittitiedot perustuvat liikennöitsijöiden ilmoittamiin aikataulutietoihin. Voit tutkia palvelun avulla myös kävelyn, pyöräilyn ja yksityisautoilun reittejä, mutta nämä eivät kaikilta osin ole ajantasaisia. Palvelu perustuu valtakunnallisessa käytössä olevaan Digitransit-palvelualustaan.',
          'Reittiopas näyttää Linkki-liikenteestä sekä linja-autojen gps-seurantaan perustuvia, reaaliaikaisia aikatauluarvioita että aikataulusuunnitelman mukaisia aikataulutietoja. Reaaliaikaisena tieto näkyy silloin, kun vuoro on liikkeellä ja lähettää palveluun seurantatietoa. Reaaliaikaisen tiedon tunnistaa saapumisajan ohessa vilkkuvasta reaaliaikasymbolista. Ole pysäkillä ajoissa, sillä välipysäkeille ei jäädä odottamaan arvion mukaista lähtöaikaa, vaan auton matka jatkuu välittömästi.',
        ],
      },
    ],

    sv: [
      {
        header: 'Om tjänsten',
        paragraphs: [
          'Denna tjänst är avsedd att underlätta planeringen, när du reser i Jyväskylä, Laukaa och Muurame. Utvalda kollektivtrafikens tidtabeller och rutter är baserad på Linkki-lokaltrafikens giltiga tidtabellsdata. Regiontrafikens tidtabeller och ruttinformationer är baserad på tidtabellsinformationen från kollektivtrafikföretag. Med hjälp av reseplaneraren kan du också utforska gång-, cyklingsrutten samt rutter för privatbilismen. Tjänsten är baserad på Digitransit, som är riksomfattande serviceplattform för reseplanerare.',
          'Reseplaneraren visar Linkki-lokaltrafikens tidtabell både i realtid baserad på GPS-spårning av bussar såväl som schemalagd tidtabellsinformation. Informationen visas i realtid när en busstur är i rörelse och skickar spårningsinformation till tjänsten. Realtidsinformation identifieras med en blinkande realtidsymbol vid sidan av ankomsttiden. Det lönar sig att vara på hållplatsen i tid, eftersom på mellanliggande hållplats väntar bussen inte för att kunna avgå enligt tidtabellen utan fortsätter resan omedelbart.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'This service is intended to facilitate planning when traveling in the Jyväskylä, Laukaa and Muurame areas. The public transport timetables and routes shown are based on the current data for local traffic (Linkki). Regional transport timetables and route information are based on the timetable information from transport service provider. With the help of the journey planner you can also explore the walking and cycling route as well routes for private motoring. The service is based on Digitransit, which is a nationwide service platform for journey planner.',
          'The journey planner shows both estimated real-time timetables for Linkki based on GPS tracking of buses as well as scheduled timetable information. The information is displayed in real time when a bus shift is in motion and sends tracking information to the service. Real-time information is identified by a flashing real-time symbol beside the arrival time.',
          'It is important for the passengers to arrive early at the bus stop because at the intermediate bus stop the bus does not wait to be able to depart according to the timetable but continues the journey immediately.',
        ],
      },
    ],
  },

  geoJson: {
    layers: [
      {
        name: {
          fi: 'Vyöhykkeet',
          sv: 'Zoner',
          en: 'Zones',
        },
        url: '/assets/geojson/jkl_zone_lines_20200401.geojson',
      },
    ],
  },

  zoneIdMapping: {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
  },
  itinerary: {
    showZoneLimits: true,
  },

  stopCard: {
    header: {
      showZone: true,
    },
  },
});

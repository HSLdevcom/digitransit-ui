/* eslint quote-props: 0, max-len: 0 */

export const realtimeDeparture = {
  stop: {
    code: '4611',
  },

  stoptime: 1444165199,
  realtime: true,

  pattern: {
    __dataID__: 'UGF0dGVybjpIU0w6NDYxMToxOjAx',

    route: {
      __dataID__: 'Um91dGU6SFNMOjQ2MTE=',
      gtfsId: 'HSL:4611',
      shortName: '611',
      longName: 'Rautatientori - Siltamäki - Suutarila - Tikkurila',
      type: 'BUS',
      color: null,
    },

    code: 'HSL:4611:1:01',
    headsign: 'Rautatientori',
  },
};

export const departure = {
  stop: {
    code: '1007',
  },

  stoptime: 1444185960,
  realtime: false,

  pattern: {
    __dataID__: 'UGF0dGVybjpIU0w6MTAwN0I6MDowMg==',

    route: {
      __dataID__: 'Um91dGU6SFNMOjEwMDdC',
      gtfsId: 'HSL:1007B',
      shortName: '7B',
      longName: 'Senaatintori-Pasila-Töölö-Senaatintori',
      type: 'TRAM',
      color: null,
    },

    code: 'HSL:1007B:0:02',
    headsign: 'Pasila',
  },
};

export const currentTime = new Date().getTime() / 1000;

export const station = {
  bikesAvailable: 1,
  spacesAvailable: 1,
  stationId: 'A07',
  name: 'Fredrikinkatu 27',
  lon: 24.939603788199364,
  lat: 60.1626075196532,
};

export const favouriteLocation = {
  locationName: 'Työ',
  favouriteLocationIconId: 'icon-icon_place',
  arrivalTime: 1444175199,
  departureTime: 1444165199,
  realtime: true,
  currentTime: 1444165100,

  firstTransitLeg: {
    realTime: true,
    mode: 'BUS',

    route: {
      shortName: '123',
    },
  },
};

export const options = [
  {
    feature: {
      properties: {
        gtfsId: 'HSL:1301453',
        type: 'TRAM',
        name: 'Laajalahden aukio',
        patterns: '[{"headsign":"Töölö","type":"TRAM","shortName":"4"}]',
      },
    },
    layer: 'stop',
  },
  {
    feature: {
      properties: {
        gtfsId: 'HSL:1301452',
        type: 'TRAM',
        name: 'Laajalahden aukio',
        patterns: '[{"headsign":"Munkkiniemi","type":"TRAM","shortName":"4T"}]',
      },
    },
    layer: 'stop',
  },
];

export const plan = {
  'itineraries': [{
    'walkDistance': 465.2611547749316,
    'duration': 731,
    'startTime': 1463406749000,
    'endTime': 1463407480000,
    'legs': [{
      'mode': 'WALK',
      'agency': null,
      'from': {
        'lat': 60.19922449999999,
        'lon': 24.9400405,
        'name': 'Ratamestarinkatu 5, Helsinki',
        'vertexType': 'NORMAL',
        'bikeRentalStation': null,
        'stop': null,
      },
      'to': {
        'lat': 60.19866269999994,
        'lon': 24.933482300000076,
        'name': 'Pasila',
        'vertexType': 'TRANSIT',
        'bikeRentalStation': null,
        'stop': {
          'gtfsId': 'HSL:1174552',
          'code': '0071',
          'id': 'U3RvcDpIU0w6MTE3NDU1Mg==',
        },
      },
      'legGeometry': {
        'length': 33,
        'points': 'ktlnJabfwC[NMDDj@?H@L@H@PFfADhC@TT|DBh@?BFdAJvADp@Dt@HtA?DDr@@H@FJrB@D???B?DBVB\\D|@FfATI',
      },
      'intermediateStops': [],
      'realTime': false,
      'transitLeg': false,
      'rentedBike': false,
      'startTime': 1463406749000,
      'endTime': 1463407139000,
      'distance': 427.403,
      'duration': 390,
      'route': null,
      'trip': null,
    }, {
      'mode': 'RAIL',
      'agency': {
        'name': 'Helsingin seudun liikenne',
        'id': 'QWdlbmN5OkhTTA==',
      },
      'from': {
        'lat': 60.19866269999994,
        'lon': 24.933482300000076,
        'name': 'Pasila',
        'vertexType': 'TRANSIT',
        'bikeRentalStation': null,
        'stop': {
          'gtfsId': 'HSL:1174552',
          'code': '0071',
          'id': 'U3RvcDpIU0w6MTE3NDU1Mg==',
        },
      },
      'to': {
        'lat': 60.17131980000005,
        'lon': 24.941456599999952,
        'name': 'Helsinki',
        'vertexType': 'TRANSIT',
        'bikeRentalStation': null,
        'stop': {
          'gtfsId': 'HSL:1020552',
          'code': '0070',
          'id': 'U3RvcDpIU0w6MTAyMDU1Mg==',
        },
      },
      'legGeometry': {
        'length': 2,
        'points': 'splnJgydwC|iDyp@',
      },
      'intermediateStops': [],
      'realTime': false,
      'transitLeg': true,
      'rentedBike': false,
      'startTime': 1463407140000,
      'endTime': 1463407440000,
      'distance': 3072.1942153850637,
      'duration': 300,
      'route': {
        'shortName': 'A',
        'id': 'Um91dGU6SFNMOjMwMDJB',
      },
      'trip': {
        'gtfsId': 'HSL:3002A_20160509_Ma_2_1647',
        'tripHeadsign': 'Helsinki',
        'id': 'VHJpcDpIU0w6MzAwMkFfMjAxNjA1MDlfTWFfMl8xNjQ3',
      },
    }, {
      'mode': 'WALK',
      'agency': null,
      'from': {
        'lat': 60.17131980000005,
        'lon': 24.941456599999952,
        'name': 'Helsinki',
        'vertexType': 'TRANSIT',
        'bikeRentalStation': null,
        'stop': {
          'gtfsId': 'HSL:1020552',
          'code': '0070',
          'id': 'U3RvcDpIU0w6MTAyMDU1Mg==',
        },
      },
      'to': {
        'lat': 60.171198,
        'lon': 24.941828,
        'name': 'Asema-Aukio 1, Helsinki',
        'vertexType': 'NORMAL',
        'bikeRentalStation': null,
        'stop': null,
      },
      'legGeometry': {
        'length': 4,
        'points': 'segnJekfwCKo@TCRA',
      },
      'intermediateStops': [],
      'realTime': false,
      'transitLeg': false,
      'rentedBike': false,
      'startTime': 1463407441000,
      'endTime': 1463407480000,
      'distance': 37.714,
      'duration': 39,
      'route': null,
      'trip': null,
    }],
  }, {
    'walkDistance': 465.2611547749316,
    'duration': 731,
    'startTime': 1463406929000,
    'endTime': 1463407660000,
    'legs': [{
      'mode': 'WALK',
      'agency': null,
      'from': {
        'lat': 60.19922449999999,
        'lon': 24.9400405,
        'name': 'Ratamestarinkatu 5, Helsinki',
        'vertexType': 'NORMAL',
        'bikeRentalStation': null,
        'stop': null,
      },
      'to': {
        'lat': 60.19866269999994,
        'lon': 24.933482300000076,
        'name': 'Pasila',
        'vertexType': 'TRANSIT',
        'bikeRentalStation': null,
        'stop': {
          'gtfsId': 'HSL:1174552',
          'code': '0071',
          'id': 'U3RvcDpIU0w6MTE3NDU1Mg==',
        },
      },
      'legGeometry': {
        'length': 33,
        'points': 'ktlnJabfwC[NMDDj@?H@L@H@PFfADhC@TT|DBh@?BFdAJvADp@Dt@HtA?DDr@@H@FJrB@D???B?DBVB\\D|@FfATI',
      },
      'intermediateStops': [],
      'realTime': false,
      'transitLeg': false,
      'rentedBike': false,
      'startTime': 1463406929000,
      'endTime': 1463407319000,
      'distance': 427.403,
      'duration': 390,
      'route': null,
      'trip': null,
    }, {
      'mode': 'RAIL',
      'agency': {
        'name': 'Helsingin seudun liikenne',
        'id': 'QWdlbmN5OkhTTA==',
      },
      'from': {
        'lat': 60.19866269999994,
        'lon': 24.933482300000076,
        'name': 'Pasila',
        'vertexType': 'TRANSIT',
        'bikeRentalStation': null,
        'stop': {
          'gtfsId': 'HSL:1174552',
          'code': '0071',
          'id': 'U3RvcDpIU0w6MTE3NDU1Mg==',
        },
      },
      'to': {
        'lat': 60.17131980000005,
        'lon': 24.941456599999952,
        'name': 'Helsinki',
        'vertexType': 'TRANSIT',
        'bikeRentalStation': null,
        'stop': {
          'gtfsId': 'HSL:1020552',
          'code': '0070',
          'id': 'U3RvcDpIU0w6MTAyMDU1Mg==',
        },
      },
      'legGeometry': {
        'length': 2,
        'points': 'splnJgydwC|iDyp@',
      },
      'intermediateStops': [],
      'realTime': false,
      'transitLeg': true,
      'rentedBike': false,
      'startTime': 1463407320000,
      'endTime': 1463407620000,
      'distance': 3072.1942153850637,
      'duration': 300,
      'route': {
        'shortName': 'Y',
        'id': 'Um91dGU6SFNMOjMwMDJZ',
      },
      'trip': {
        'gtfsId': 'HSL:3002Y_20160509_Ma_2_1621',
        'tripHeadsign': 'Helsinki',
        'id': 'VHJpcDpIU0w6MzAwMllfMjAxNjA1MDlfTWFfMl8xNjIx',
      },
    }, {
      'mode': 'WALK',
      'agency': null,
      'from': {
        'lat': 60.17131980000005,
        'lon': 24.941456599999952,
        'name': 'Helsinki',
        'vertexType': 'TRANSIT',
        'bikeRentalStation': null,
        'stop': {
          'gtfsId': 'HSL:1020552',
          'code': '0070',
          'id': 'U3RvcDpIU0w6MTAyMDU1Mg==',
        },
      },
      'to': {
        'lat': 60.171198,
        'lon': 24.941828,
        'name': 'Asema-Aukio 1, Helsinki',
        'vertexType': 'NORMAL',
        'bikeRentalStation': null,
        'stop': null,
      },
      'legGeometry': {
        'length': 4,
        'points': 'segnJekfwCKo@TCRA',
      },
      'intermediateStops': [],
      'realTime': false,
      'transitLeg': false,
      'rentedBike': false,
      'startTime': 1463407621000,
      'endTime': 1463407660000,
      'distance': 37.714,
      'duration': 39,
      'route': null,
      'trip': null,
    }],
  }, {
    'walkDistance': 465.2611547749316,
    'duration': 731,
    'startTime': 1463407049000,
    'endTime': 1463407780000,
    'legs': [{
      'mode': 'WALK',
      'agency': null,
      'from': {
        'lat': 60.19922449999999,
        'lon': 24.9400405,
        'name': 'Ratamestarinkatu 5, Helsinki',
        'vertexType': 'NORMAL',
        'bikeRentalStation': null,
        'stop': null,
      },
      'to': {
        'lat': 60.19866269999994,
        'lon': 24.933482300000076,
        'name': 'Pasila',
        'vertexType': 'TRANSIT',
        'bikeRentalStation': null,
        'stop': {
          'gtfsId': 'HSL:1174552',
          'code': '0071',
          'id': 'U3RvcDpIU0w6MTE3NDU1Mg==',
        },
      },
      'legGeometry': {
        'length': 33,
        'points': 'ktlnJabfwC[NMDDj@?H@L@H@PFfADhC@TT|DBh@?BFdAJvADp@Dt@HtA?DDr@@H@FJrB@D???B?DBVB\\D|@FfATI',
      },
      'intermediateStops': [],
      'realTime': false,
      'transitLeg': false,
      'rentedBike': false,
      'startTime': 1463407049000,
      'endTime': 1463407439000,
      'distance': 427.403,
      'duration': 390,
      'route': null,
      'trip': null,
    }, {
      'mode': 'RAIL',
      'agency': {
        'name': 'Helsingin seudun liikenne',
        'id': 'QWdlbmN5OkhTTA==',
      },
      'from': {
        'lat': 60.19866269999994,
        'lon': 24.933482300000076,
        'name': 'Pasila',
        'vertexType': 'TRANSIT',
        'bikeRentalStation': null,
        'stop': {
          'gtfsId': 'HSL:1174552',
          'code': '0071',
          'id': 'U3RvcDpIU0w6MTE3NDU1Mg==',
        },
      },
      'to': {
        'lat': 60.17131980000005,
        'lon': 24.941456599999952,
        'name': 'Helsinki',
        'vertexType': 'TRANSIT',
        'bikeRentalStation': null,
        'stop': {
          'gtfsId': 'HSL:1020552',
          'code': '0070',
          'id': 'U3RvcDpIU0w6MTAyMDU1Mg==',
        },
      },
      'legGeometry': {
        'length': 2,
        'points': 'splnJgydwC|iDyp@',
      },
      'intermediateStops': [],
      'realTime': false,
      'transitLeg': true,
      'rentedBike': false,
      'startTime': 1463407440000,
      'endTime': 1463407740000,
      'distance': 3072.1942153850637,
      'duration': 300,
      'route': {
        'shortName': 'I',
        'id': 'Um91dGU6SFNMOjMwMDFJ',
      },
      'trip': {
        'gtfsId': 'HSL:3001I_20160509_Ma_1_1609',
        'tripHeadsign': 'Helsinki',
        'id': 'VHJpcDpIU0w6MzAwMUlfMjAxNjA1MDlfTWFfMV8xNjA5',
      },
    }, {
      'mode': 'WALK',
      'agency': null,
      'from': {
        'lat': 60.17131980000005,
        'lon': 24.941456599999952,
        'name': 'Helsinki',
        'vertexType': 'TRANSIT',
        'bikeRentalStation': null,
        'stop': {
          'gtfsId': 'HSL:1020552',
          'code': '0070',
          'id': 'U3RvcDpIU0w6MTAyMDU1Mg==',
        },
      },
      'to': {
        'lat': 60.171198,
        'lon': 24.941828,
        'name': 'Asema-Aukio 1, Helsinki',
        'vertexType': 'NORMAL',
        'bikeRentalStation': null,
        'stop': null,
      },
      'legGeometry': {
        'length': 4,
        'points': 'segnJekfwCKo@TCRA',
      },
      'intermediateStops': [],
      'realTime': false,
      'transitLeg': false,
      'rentedBike': false,
      'startTime': 1463407741000,
      'endTime': 1463407780000,
      'distance': 37.714,
      'duration': 39,
      'route': null,
      'trip': null,
    }],
  }],
};

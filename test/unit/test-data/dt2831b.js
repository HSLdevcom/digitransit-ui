export const exampleData = {
  walkDistance: 641.8358333172072,
  duration: 835,
  startTime: 1549613561000,
  endTime: 1549614396000,
  elevationGained: 7.209999999999997,
  elevationLost: 10.409999999999993,
  fares: [
    {
      type: 'regular',
      currency: 'EUR',
      cents: 320,
      components: [
        {
          fareId: 'HSL:hki',
        },
      ],
    },
  ],
  legs: [
    {
      mode: 'WALK',
      from: {
        lat: 60.199087,
        lon: 24.940641,
        name: 'Opastinsilta 6, Helsinki',
        vertexType: 'NORMAL',
        bikeRentalStation: null,
        stop: null,
      },
      to: {
        lat: 60.199534,
        lon: 24.933032,
        name: 'Pasila',
        vertexType: 'TRANSIT',
        bikeRentalStation: null,
        stop: {
          gtfsId: 'HSL:1174553',
          code: '0089',
          platformCode: '5',
          zoneId: '01',
        },
      },
      legGeometry: {
        length: 41,
        points:
          'uslnJyefwC@LMDg@RE@GD@XB\\F|@Dz@@H@XDj@PbCBZPvDBl@@DXbF?@HrADb@@PB^?J@FGBC@E@Dv@{B|@FbA?TBd@??F`A??F`A??UHE@',
      },
      intermediatePlaces: [],
      realTime: false,
      realtimeState: 'SCHEDULED',
      transitLeg: false,
      rentedBike: false,
      startTime: 1549613561000,
      endTime: 1549614087000,
      distance: 549.4300000000001,
      duration: 526,
      intermediatePlace: false,
      route: null,
      trip: null,
    },
    {
      mode: 'RAIL',
      from: {
        lat: 60.199534,
        lon: 24.933032,
        name: 'Pasila',
        vertexType: 'TRANSIT',
        bikeRentalStation: null,
        stop: {
          gtfsId: 'HSL:1174553',
          code: '0089',
          platformCode: '5',
          zoneId: '01',
        },
      },
      to: {
        lat: 60.1713,
        lon: 24.941401,
        name: 'Helsinki',
        vertexType: 'TRANSIT',
        bikeRentalStation: null,
        stop: {
          gtfsId: 'HSL:1020551',
          code: '0070',
          platformCode: null,
          zoneId: '01',
        },
      },
      legGeometry: {
        length: 12,
        points: 'cvlnJ{vdwCpMiClG?jH`AbFTpLgBdK}DhHgDdi@}PvOgGzLqDb\\cC',
      },
      intermediatePlaces: [],
      realTime: true,
      realtimeState: 'CANCELED',
      transitLeg: true,
      rentedBike: false,
      startTime: 1549614087000,
      endTime: 1549614306000,
      distance: 3173.3937719649334,
      duration: 219,
      intermediatePlace: false,
      route: {
        shortName: 'Z',
        color: null,
        gtfsId: 'HSL:3001Z',
        longName: 'Helsinki-Lahti',
        desc: null,
        agency: {
          phone: '(09) 4766 4444',
        },
      },
      trip: {
        gtfsId: 'HSL:3001Z_20190207_Pe_2_0920',
        tripHeadsign: 'Helsinki',
        pattern: {
          code: 'HSL:3001Z:1:01',
        },
        stoptimes: [
          {
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              gtfsId: 'HSL:5020553',
            },
          },
          {
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              gtfsId: 'HSL:5020556',
            },
          },
          {
            __dataID__: 'client:625860012701',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6NTAyMDU1Mg==',
              gtfsId: 'HSL:5020552',
            },
          },
          {
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6NTAyMDU1MQ==',
              gtfsId: 'HSL:5020551',
            },
          },
          {
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              gtfsId: 'HSL:9040502',
            },
          },
          {
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              gtfsId: 'HSL:4610553',
            },
          },
          {
            __dataID__: 'client:625860012705',
            pickupType: 'SCHEDULED',
            realtimeState: 'CANCELED',
            stop: {
              gtfsId: 'HSL:1174553',
            },
          },
          {
            pickupType: 'NONE',
            realtimeState: 'SCHEDULED',
            stop: {
              gtfsId: 'HSL:1020551',
            },
          },
        ],
      },
    },
    {
      mode: 'WALK',
      from: {
        lat: 60.1713,
        lon: 24.941401,
        name: 'Helsinki',
        vertexType: 'TRANSIT',
        bikeRentalStation: null,
        stop: {
          gtfsId: 'HSL:1020551',
          code: '0070',
          platformCode: null,
          zoneId: '01',
        },
      },
      to: {
        lat: 60.171283,
        lon: 24.942572,
        name: 'Rautatieasema',
        vertexType: 'NORMAL',
        bikeRentalStation: null,
        stop: null,
      },
      legGeometry: {
        length: 12,
        points: 'segnJujfwCLcANAAoB?SAG?E?E?E?C?IUF',
      },
      intermediatePlaces: [],
      realTime: false,
      realtimeState: 'SCHEDULED',
      transitLeg: false,
      rentedBike: false,
      startTime: 1549614306000,
      endTime: 1549614396000,
      distance: 92,
      duration: 90,
      intermediatePlace: false,
      route: null,
      trip: null,
    },
  ],
};

export default exampleData;

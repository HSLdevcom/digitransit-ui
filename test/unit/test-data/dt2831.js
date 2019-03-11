const dt2831 = {
  __dataID__: 'client:19810718983',
  walkDistance: 770.2575833168594,
  duration: 973,
  startTime: 1548851874000,
  endTime: 1548852847000,
  elevationGained: 8.189999999999998,
  elevationLost: 8.389999999999993,
  fares: [
    {
      __dataID__: 'client:198107189846',
      type: 'regular',
      currency: 'EUR',
      cents: 320,
      components: [
        {
          __dataID__: 'client:198107189847',
          fareId: 'HSL:hki',
        },
      ],
    },
  ],
  legs: [
    {
      __dataID__: 'client:19810718988',
      mode: 'WALK',
      from: {
        __dataID__: 'client:198107189812',
        lat: 60.199308499999994,
        lon: 24.9408328,
        name: 'Opastinsilta 6 Ak, Helsinki',
        vertexType: 'NORMAL',
        bikeRentalStation: null,
        stop: null,
      },
      to: {
        __dataID__: 'client:198107189813',
        lat: 60.199601,
        lon: 24.933683,
        name: 'Pasila',
        vertexType: 'TRANSIT',
        bikeRentalStation: null,
        stop: {
          __dataID__: 'U3RvcDpIU0w6MTE3NDU1MQ==',
          gtfsId: 'HSL:1174551',
          code: '0071',
          platformCode: '1',
          zoneId: '01',
        },
      },
      legGeometry: {
        __dataID__: 'client:198107189811',
        length: 34,
        points:
          'stlnJcgfwCILYjA@XB\\F|@Dz@@H@XDj@PbCBZPvDBl@@DXbF?@HrADb@@PB^?J@FGBC@E@Dv@{B|@FbA?TBd@??UHA@',
      },
      intermediatePlaces: [],
      realTime: false,
      transitLeg: false,
      rentedBike: false,
      startTime: 1548851874000,
      endTime: 1548852355000,
      distance: 500.6480000000001,
      duration: 481,
      intermediatePlace: false,
      route: null,
      trip: null,
      __fragments__: {
        '8::client': [{}],
      },
    },
    {
      __dataID__: 'client:19810718989',
      mode: 'RAIL',
      from: {
        __dataID__: 'client:198107189815',
        lat: 60.199601,
        lon: 24.933683,
        name: 'Pasila',
        vertexType: 'TRANSIT',
        bikeRentalStation: null,
        stop: {
          __dataID__: 'U3RvcDpIU0w6MTE3NDU1MQ==',
          gtfsId: 'HSL:1174551',
          code: '0071',
          platformCode: '1',
          stoptimes: [
            {
              __dataID__: 'client:198107189848',
              pickupType: 'SCHEDULED',
              realtimeState: 'UPDATED',
              stop: {
                __dataID__: 'U3RvcDpIU0w6MTE3NDU1MQ==',
                gtfsId: 'HSL:1174551',
              },
              trip: {
                __dataID__: 'VHJpcDpIU0w6MzAwMlBfMjAxOTAxMjlfS2VfMV8xMzM4',
                gtfsId: 'HSL:3002P_20190129_Ke_1_1338',
                routeShortName: 'P',
                tripHeadsign: 'Helsinki',
              },
            },
            {
              __dataID__: 'client:198107189849',
              pickupType: 'SCHEDULED',
              realtimeState: 'CANCELED',
              stop: {
                __dataID__: 'U3RvcDpIU0w6MTE3NDU1MQ==',
                gtfsId: 'HSL:1174551',
              },
              trip: {
                __dataID__: 'VHJpcDpIU0w6MzAwMUtfMjAxOTAxMjlfS2VfMl8xNDEx',
                gtfsId: 'HSL:3001K_20190129_Ke_2_1411',
                routeShortName: 'K',
                tripHeadsign: 'Helsinki',
              },
            },
            {
              __dataID__: 'client:198107189850',
              pickupType: 'SCHEDULED',
              realtimeState: 'UPDATED',
              stop: {
                __dataID__: 'U3RvcDpIU0w6MTE3NDU1MQ==',
                gtfsId: 'HSL:1174551',
              },
              trip: {
                __dataID__: 'VHJpcDpIU0w6MzAwMlBfMjAxOTAxMjlfS2VfMV8xMzQ4',
                gtfsId: 'HSL:3002P_20190129_Ke_1_1348',
                routeShortName: 'P',
                tripHeadsign: 'Helsinki',
              },
            },
            {
              __dataID__: 'client:198107189851',
              pickupType: 'SCHEDULED',
              realtimeState: 'UPDATED',
              stop: {
                __dataID__: 'U3RvcDpIU0w6MTE3NDU1MQ==',
                gtfsId: 'HSL:1174551',
              },
              trip: {
                __dataID__: 'VHJpcDpIU0w6MzAwMUtfMjAxOTAxMjlfS2VfMl8xNDIx',
                gtfsId: 'HSL:3001K_20190129_Ke_2_1421',
                routeShortName: 'K',
                tripHeadsign: 'Helsinki',
              },
            },
            {
              __dataID__: 'client:198107189852',
              pickupType: 'SCHEDULED',
              realtimeState: 'UPDATED',
              stop: {
                __dataID__: 'U3RvcDpIU0w6MTE3NDU1MQ==',
                gtfsId: 'HSL:1174551',
              },
              trip: {
                __dataID__: 'VHJpcDpIU0w6MzAwMlBfMjAxOTAxMjlfS2VfMV8xMzU4',
                gtfsId: 'HSL:3002P_20190129_Ke_1_1358',
                routeShortName: 'P',
                tripHeadsign: 'Helsinki',
              },
            },
          ],
          zoneId: '01',
        },
      },
      to: {
        __dataID__: 'client:198107189816',
        lat: 60.172987,
        lon: 24.941576,
        name: 'Helsinki',
        vertexType: 'TRANSIT',
        bikeRentalStation: null,
        stop: {
          __dataID__: 'U3RvcDpIU0w6MTAyMDU1Mw==',
          gtfsId: 'HSL:1020553',
          code: '0070',
          platformCode: '1-3',
          zoneId: '01',
        },
      },
      legGeometry: {
        __dataID__: 'client:198107189814',
        length: 12,
        points: 'ovlnJi{dwClJi@|PNxIfBpFg@tDq@dK}DhHgDdi@}PvOgGzLqDrQeD',
      },
      intermediatePlaces: [],
      realTime: true,
      transitLeg: true,
      rentedBike: false,
      startTime: 1548852355000,
      endTime: 1548852600000,
      distance: 2991.3440698048153,
      duration: 245,
      intermediatePlace: false,
      route: {
        __dataID__: 'Um91dGU6SFNMOjMwMDJQ',
        shortName: 'P',
        color: null,
        gtfsId: 'HSL:3002P',
        longName: 'Helsinki-Helsinki',
        desc: null,
        agency: {
          __dataID__: 'QWdlbmN5OkhTTA==',
          phone: '(09) 4766 4444',
        },
      },
      trip: {
        __dataID__: 'VHJpcDpIU0w6MzAwMlBfMjAxOTAxMjlfS2VfMV8xMzQ4',
        gtfsId: 'HSL:3002P_20190129_Ke_1_1348',
        tripHeadsign: 'Helsinki',
        pattern: {
          __dataID__: 'UGF0dGVybjpIU0w6MzAwMlA6MDowMQ==',
          code: 'HSL:3002P:0:01',
        },
        stoptimes: [
          {
            __dataID__: 'client:198107189817',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTAyMDUwMg==',
              gtfsId: 'HSL:1020502',
            },
          },
          {
            __dataID__: 'client:198107189818',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTE3NDUwMg==',
              gtfsId: 'HSL:1174502',
            },
          },
          {
            __dataID__: 'client:198107189819',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTE3MjUwMw==',
              gtfsId: 'HSL:1172503',
            },
          },
          {
            __dataID__: 'client:198107189820',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTI5MTUwMQ==',
              gtfsId: 'HSL:1291501',
            },
          },
          {
            __dataID__: 'client:198107189821',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTI5NDU1Mg==',
              gtfsId: 'HSL:1294552',
            },
          },
          {
            __dataID__: 'client:198107189822',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTMzMTU1MQ==',
              gtfsId: 'HSL:1331551',
            },
          },
          {
            __dataID__: 'client:198107189823',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTMzMzU1Mg==',
              gtfsId: 'HSL:1333552',
            },
          },
          {
            __dataID__: 'client:198107189824',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6NDE1MDU1MQ==',
              gtfsId: 'HSL:4150551',
            },
          },
          {
            __dataID__: 'client:198107189825',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6NDE1MDU1Mg==',
              gtfsId: 'HSL:4150552',
            },
          },
          {
            __dataID__: 'client:198107189826',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6NDE3MDU1MQ==',
              gtfsId: 'HSL:4170551',
            },
          },
          {
            __dataID__: 'client:198107189827',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6NDE3MDU1Mg==',
              gtfsId: 'HSL:4170552',
            },
          },
          {
            __dataID__: 'client:198107189828',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6NDI1MDU1MQ==',
              gtfsId: 'HSL:4250551',
            },
          },
          {
            __dataID__: 'client:198107189829',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6NDIzMDU1MQ==',
              gtfsId: 'HSL:4230551',
            },
          },
          {
            __dataID__: 'client:198107189830',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6NDUyMDU1MQ==',
              gtfsId: 'HSL:4520551',
            },
          },
          {
            __dataID__: 'client:198107189831',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6NDUzMDUwMQ==',
              gtfsId: 'HSL:4530501',
            },
          },
          {
            __dataID__: 'client:198107189832',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6NDcwMDUwMQ==',
              gtfsId: 'HSL:4700501',
            },
          },
          {
            __dataID__: 'client:198107189833',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6NDYwMDU1MQ==',
              gtfsId: 'HSL:4600551',
            },
          },
          {
            __dataID__: 'client:198107189834',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6NDYxMDU1MQ==',
              gtfsId: 'HSL:4610551',
            },
          },
          {
            __dataID__: 'client:198107189835',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTQxMTU1MQ==',
              gtfsId: 'HSL:1411551',
            },
          },
          {
            __dataID__: 'client:198107189836',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTM5MjU1MQ==',
              gtfsId: 'HSL:1392551',
            },
          },
          {
            __dataID__: 'client:198107189837',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTM4MjU1MQ==',
              gtfsId: 'HSL:1382551',
            },
          },
          {
            __dataID__: 'client:198107189838',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTM3MDU1MQ==',
              gtfsId: 'HSL:1370551',
            },
          },
          {
            __dataID__: 'client:198107189839',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTI4NTU1MQ==',
              gtfsId: 'HSL:1285551',
            },
          },
          {
            __dataID__: 'client:198107189840',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTI1MDU1MQ==',
              gtfsId: 'HSL:1250551',
            },
          },
          {
            __dataID__: 'client:198107189841',
            pickupType: 'SCHEDULED',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTE3NDU1MQ==',
              gtfsId: 'HSL:1174551',
            },
          },
          {
            __dataID__: 'client:198107189842',
            pickupType: 'NONE',
            realtimeState: 'SCHEDULED',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTAyMDU1Mw==',
              gtfsId: 'HSL:1020553',
            },
          },
        ],
      },
      __fragments__: {
        '8::client': [{}],
      },
    },
    {
      __dataID__: 'client:198107189810',
      mode: 'WALK',
      from: {
        __dataID__: 'client:198107189844',
        lat: 60.172987,
        lon: 24.941576,
        name: 'Helsinki',
        vertexType: 'TRANSIT',
        bikeRentalStation: null,
        stop: {
          __dataID__: 'U3RvcDpIU0w6MTAyMDU1Mw==',
          gtfsId: 'HSL:1020553',
          code: '0070',
          platformCode: '1-3',
          stoptimes: [
            {
              __dataID__: 'client:198107189853',
              pickupType: 'NONE',
              realtimeState: 'UPDATED',
              stop: {
                __dataID__: 'U3RvcDpIU0w6MTAyMDU1Mw==',
                gtfsId: 'HSL:1020553',
              },
              trip: {
                __dataID__: 'VHJpcDpIU0w6MzAwMUtfMjAxOTAxMjlfS2VfMl8xNDAx',
                gtfsId: 'HSL:3001K_20190129_Ke_2_1401',
                routeShortName: 'K',
                tripHeadsign: 'Helsinki',
              },
            },
            {
              __dataID__: 'client:198107189854',
              pickupType: 'NONE',
              realtimeState: 'UPDATED',
              stop: {
                __dataID__: 'U3RvcDpIU0w6MTAyMDU1Mw==',
                gtfsId: 'HSL:1020553',
              },
              trip: {
                __dataID__: 'VHJpcDpIU0w6MzAwMlBfMjAxOTAxMjlfS2VfMV8xMzM4',
                gtfsId: 'HSL:3002P_20190129_Ke_1_1338',
                routeShortName: 'P',
                tripHeadsign: 'Helsinki',
              },
            },
            {
              __dataID__: 'client:198107189855',
              pickupType: 'NONE',
              realtimeState: 'CANCELED',
              stop: {
                __dataID__: 'U3RvcDpIU0w6MTAyMDU1Mw==',
                gtfsId: 'HSL:1020553',
              },
              trip: {
                __dataID__: 'VHJpcDpIU0w6MzAwMUtfMjAxOTAxMjlfS2VfMl8xNDEx',
                gtfsId: 'HSL:3001K_20190129_Ke_2_1411',
                routeShortName: 'K',
                tripHeadsign: 'Helsinki',
              },
            },
            {
              __dataID__: 'client:198107189856',
              pickupType: 'NONE',
              realtimeState: 'UPDATED',
              stop: {
                __dataID__: 'U3RvcDpIU0w6MTAyMDU1Mw==',
                gtfsId: 'HSL:1020553',
              },
              trip: {
                __dataID__: 'VHJpcDpIU0w6MzAwMlBfMjAxOTAxMjlfS2VfMV8xMzQ4',
                gtfsId: 'HSL:3002P_20190129_Ke_1_1348',
                routeShortName: 'P',
                tripHeadsign: 'Helsinki',
              },
            },
            {
              __dataID__: 'client:198107189857',
              pickupType: 'NONE',
              realtimeState: 'UPDATED',
              stop: {
                __dataID__: 'U3RvcDpIU0w6MTAyMDU1Mw==',
                gtfsId: 'HSL:1020553',
              },
              trip: {
                __dataID__: 'VHJpcDpIU0w6MzAwMUtfMjAxOTAxMjlfS2VfMl8xNDIx',
                gtfsId: 'HSL:3001K_20190129_Ke_2_1421',
                routeShortName: 'K',
                tripHeadsign: 'Helsinki',
              },
            },
          ],
          zoneId: '01',
        },
      },
      to: {
        __dataID__: 'client:198107189845',
        lat: 60.171283,
        lon: 24.942572,
        name: 'Rautatieasema',
        vertexType: 'NORMAL',
        bikeRentalStation: null,
        stop: null,
      },
      legGeometry: {
        __dataID__: 'client:198107189843',
        length: 17,
        points: 'cpgnJukfwCHA?CB??BtH_@XANAAoB?SAG?E?E?E?C?IUF',
      },
      intermediatePlaces: [],
      realTime: false,
      transitLeg: false,
      rentedBike: false,
      startTime: 1548852600000,
      endTime: 1548852847000,
      distance: 269.195,
      duration: 247,
      intermediatePlace: false,
      route: null,
      trip: null,
      __fragments__: {
        '8::client': [{}],
      },
    },
  ],
};

export default dt2831;

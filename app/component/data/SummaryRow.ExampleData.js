export const exampleData = t1 => ({
  startTime: t1,
  endTime: t1 + 10000,
  walkDistance: 770,
  legs: [
    {
      realTime: false,
      transitLeg: false,
      startTime: t1 + 10000,
      endTime: t1 + 20000,
      mode: 'WALK',
      distance: 483.84600000000006,
      duration: 438,
      rentedBike: false,
      route: null,
      from: { name: 'Messuaukio 1, Helsinki' },
    },
    {
      realTime: false,
      transitLeg: true,
      startTime: t1 + 20000,
      endTime: t1 + 30000,
      mode: 'BUS',
      distance: 586.4621425755712,
      duration: 120,
      rentedBike: false,
      route: { shortName: '57', mode: 'BUS' },
      from: { name: 'Ilmattarentie' },
    },
    {
      realTime: false,
      transitLeg: false,
      startTime: t1 + 30000,
      endTime: t1 + 40000,
      mode: 'WALK',
      distance: 291.098,
      duration: 259,
      rentedBike: false,
      route: null,
      from: { name: 'Veturitie' },
    },
  ],
});

export const exampleDataVia = t1 => ({
  startTime: t1,
  endTime: t1 + 10000,
  walkDistance: 770,
  legs: [
    {
      realTime: false,
      transitLeg: false,
      startTime: t1 + 10000,
      endTime: t1 + 20000,
      mode: 'WALK',
      distance: 200,
      duration: 438,
      rentedBike: false,
      route: null,
      from: { name: 'Messuaukio 1, Helsinki' },
    },
    {
      realTime: false,
      transitLeg: true,
      startTime: t1 + 20000,
      endTime: t1 + 30000,
      mode: 'BUS',
      distance: 586.4621425755712,
      duration: 120,
      rentedBike: false,
      route: { shortName: '57', mode: 'BUS' },
      from: { name: 'Ilmattarentie' },
    },
    {
      realTime: false,
      transitLeg: true,
      startTime: t1 + 30000,
      endTime: t1 + 40000,
      mode: 'WALK',
      intermediatePlace: true,
      distance: 400,
      duration: 600,
      rentedBike: false,
      route: null,
      from: { name: 'Ilmattarentie' },
    },
    {
      realTime: false,
      transitLeg: true,
      startTime: t1 + 40000,
      endTime: t1 + 50000,
      mode: 'BUS',
      distance: 586.4621425755712,
      duration: 120,
      rentedBike: false,
      route: { shortName: '57', mode: 'BUS' },
      from: { name: 'Messuaukio 1, Helsinki' },
    },
    {
      realTime: false,
      transitLeg: false,
      startTime: t1 + 50000,
      endTime: t1 + 60000,
      mode: 'WALK',
      distance: 170,
      duration: 259,
      rentedBike: false,
      route: null,
      from: { name: 'Messuaukio 1, Helsinki' },
    },
  ],
});

export const exampleDataCallAgency = t1 => ({
  startTime: t1,
  endTime: t1 + 10000,
  walkDistance: 770,
  legs: [
    {
      realTime: false,
      transitLeg: false,
      startTime: t1 + 10000,
      endTime: t1 + 20000,
      mode: 'WALK',
      distance: 483.84600000000006,
      duration: 438,
      rentedBike: false,
      route: null,
      from: { name: 'Messuaukio 1, Helsinki' },
    },
    {
      realTime: false,
      transitLeg: true,
      startTime: t1 + 20000,
      endTime: t1 + 30000,
      mode: 'BUS',
      distance: 586.4621425755712,
      duration: 120,
      rentedBike: false,
      route: { shortName: '57', mode: 'BUS' },
      from: { name: 'Ilmattarentie', stop: { gtfsId: 'start' } },
      to: { name: 'Joku Pysäkki', stop: { gtfsId: 'end' } },
      trip: {
        stoptimes: [
          {
            pickupType: 'CALL_AGENCY',
            stop: { gtfsId: 'start' },
          },
        ],
      },
    },
    {
      realTime: false,
      transitLeg: false,
      startTime: t1 + 30000,
      endTime: t1 + 40000,
      mode: 'WALK',
      distance: 291.098,
      duration: 259,
      rentedBike: false,
      route: null,
      from: { name: 'Veturitie' },
    },
  ],
});

export const exampleDataBiking = t1 => ({
  startTime: t1,
  endTime: t1 + 1080000,
  walkDistance: 770,
  legs: [
    {
      realTime: false,
      transitLeg: false,
      startTime: t1 + 100000,
      endTime: t1 + 200000,
      mode: 'WALK',
      distance: 483.84600000000006,
      duration: 438,
      rentedBike: false,
      route: null,
      from: { name: 'Messuaukio 1, Helsinki' },
    },
    {
      realTime: false,
      transitLeg: false,
      startTime: t1 + 200000,
      endTime: t1 + 300000,
      mode: 'BICYCLE',
      distance: 586.4621425755712,
      duration: 120,
      rentedBike: false,
      route: null,
      from: { name: 'Ilmattarentie' },
    },
    {
      realTime: false,
      transitLeg: false,
      startTime: t1 + 300000,
      endTime: t1 + 400000,
      mode: 'WALK',
      distance: 291.098,
      duration: 259,
      rentedBike: false,
      route: null,
      from: { name: 'Veturitie' },
    },
  ],
});

export const examplePropsCityBike = breakpoint => ({
  refTime: 1534845115623,
  breakpoint,
  data: {
    startTime: 1534844968000,
    endTime: 1534846911000,
    legs: [
      {
        mode: 'BICYCLE',
        from: {
          lat: 60.173099,
          lon: 24.949636,
          name: 'Varsapuistikko',
          vertexType: 'BIKESHARE',
          bikeRentalStation: {
            bikesAvailable: 22,
          },
          stop: null,
        },
        to: {
          lat: 60.155309,
          lon: 24.9591271,
          name: 'Ehrenströmintie',
          vertexType: 'BIKESHARE',
          bikeRentalStation: {},
          stop: null,
        },
        intermediateStops: {},
        realTime: false,
        transitLeg: false,
        rentedBike: true,
        startTime: 1534846257000,
        endTime: 1534846808000,
        distance: 2224.909000000001,
        duration: 551,
        intermediatePlace: false,
        route: null,
        trip: null,
      },
    ],
  },
  passive: true,
  onSelect: () => {},
  onSelectImmediately: () => {},
  hash: 1,
});

export const exampleDataCanceled = {
  __dataID__: 'client:-6566221813',
  walkDistance: 297.9158333249556,
  startTime: 1551272133000,
  endTime: 1551273985000,
  legs: [
    {
      __dataID__: 'client:-6566221818',
      realTime: false,
      transitLeg: false,
      startTime: 1551272133000,
      endTime: 1551272277000,
      mode: 'WALK',
      distance: 151.20499999999998,
      duration: 144,
      rentedBike: false,
      intermediatePlace: false,
      intermediatePlaces: [],
      route: null,
      trip: null,
      from: {
        __dataID__: 'client:-65662218112',
        name: 'Koskela, Helsinki',
        lat: 60.218765,
        lon: 24.968244,
        stop: null,
        bikeRentalStation: null,
      },
      to: {
        __dataID__: 'client:-65662218113',
        stop: {
          __dataID__: 'U3RvcDpIU0w6MTI2MDE4MA==',
          gtfsId: 'HSL:1260180',
          zoneId: '01',
        },
      },
    },
    {
      __dataID__: 'client:-6566221819',
      realTime: true,
      realtimeState: 'CANCELED',
      transitLeg: true,
      startTime: 1551272277000,
      endTime: 1551273846000,
      mode: 'BUS',
      distance: 7346.6573632057525,
      duration: 1569,
      rentedBike: false,
      intermediatePlace: false,
      intermediatePlaces: [
        {
          __dataID__: 'client:-65662218139',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTI2MDEwNA==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218140',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTI3MDEwNQ==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218141',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTI3MDEwMg==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218142',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTIzMDEwMQ==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218143',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTIzMDEwMw==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218144',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTIzMDExNA==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218145',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTIzMDExMg==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218146',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTI0MDEwMg==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218147',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTIxMDE2Mw==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218148',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTIxMDExMA==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218149',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTIxMDExNA==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218150',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTIxMDExMg==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218151',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTEwMDExOQ==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218152',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTEwMDEwNw==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218153',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTEwMDEyMg==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218154',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTEwMDEwMw==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218155',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTEwMDE0OQ==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218156',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTExMTE4MA==',
            zoneId: '01',
          },
        },
        {
          __dataID__: 'client:-65662218157',
          stop: {
            __dataID__: 'U3RvcDpIU0w6MTAyMDEwNg==',
            zoneId: '01',
          },
        },
      ],
      route: {
        __dataID__: 'Um91dGU6SFNMOjEwNTU=',
        mode: 'BUS',
        shortName: '55',
        color: null,
        agency: {
          __dataID__: 'QWdlbmN5OkhTTA==',
          name: 'Helsingin seudun liikenne',
        },
      },
      trip: {
        __dataID__: 'VHJpcDpIU0w6MTA1NV8yMDE5MDIyNl9LZV8yXzE0NTM=',
        alerts: [],
        stoptimes: [
          {
            __dataID__: 'client:-65662218117',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTI2MDEwOA==',
              gtfsId: 'HSL:1260108',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218118',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTI2MDE4MA==',
              gtfsId: 'HSL:1260180',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218119',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTI2MDEwNA==',
              gtfsId: 'HSL:1260104',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218120',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTI3MDEwNQ==',
              gtfsId: 'HSL:1270105',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218121',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTI3MDEwMg==',
              gtfsId: 'HSL:1270102',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218122',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTIzMDEwMQ==',
              gtfsId: 'HSL:1230101',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218123',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTIzMDEwMw==',
              gtfsId: 'HSL:1230103',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218124',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTIzMDExNA==',
              gtfsId: 'HSL:1230114',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218125',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTIzMDExMg==',
              gtfsId: 'HSL:1230112',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218126',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTI0MDEwMg==',
              gtfsId: 'HSL:1240102',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218127',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTIxMDE2Mw==',
              gtfsId: 'HSL:1210163',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218128',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTIxMDExMA==',
              gtfsId: 'HSL:1210110',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218129',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTIxMDExNA==',
              gtfsId: 'HSL:1210114',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218130',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTIxMDExMg==',
              gtfsId: 'HSL:1210112',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218131',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTEwMDExOQ==',
              gtfsId: 'HSL:1100119',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218132',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTEwMDEwNw==',
              gtfsId: 'HSL:1100107',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218133',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTEwMDEyMg==',
              gtfsId: 'HSL:1100122',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218134',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTEwMDEwMw==',
              gtfsId: 'HSL:1100103',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218135',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTEwMDE0OQ==',
              gtfsId: 'HSL:1100149',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218136',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTExMTE4MA==',
              gtfsId: 'HSL:1111180',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218137',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTAyMDEwNg==',
              gtfsId: 'HSL:1020106',
            },
            pickupType: 'SCHEDULED',
          },
          {
            __dataID__: 'client:-65662218138',
            stop: {
              __dataID__: 'U3RvcDpIU0w6MTAyMDIwMQ==',
              gtfsId: 'HSL:1020201',
            },
            pickupType: 'NONE',
          },
        ],
      },
      from: {
        __dataID__: 'client:-65662218115',
        name: 'Antti Korpin tie',
        lat: 60.21839,
        lon: 24.96627,
        stop: {
          __dataID__: 'U3RvcDpIU0w6MTI2MDE4MA==',
          gtfsId: 'HSL:1260180',
          zoneId: '01',
        },
        bikeRentalStation: null,
      },
      to: {
        __dataID__: 'client:-65662218116',
        stop: {
          __dataID__: 'U3RvcDpIU0w6MTAyMDIwMQ==',
          gtfsId: 'HSL:1020201',
          zoneId: '01',
        },
      },
    },
    {
      __dataID__: 'client:-65662218110',
      realTime: false,
      transitLeg: false,
      startTime: 1551273846000,
      endTime: 1551273985000,
      mode: 'WALK',
      distance: 146.50000000000003,
      duration: 139,
      rentedBike: false,
      intermediatePlace: false,
      intermediatePlaces: [],
      route: null,
      trip: null,
      from: {
        __dataID__: 'client:-65662218159',
        name: 'Rautatientori',
        lat: 60.17192,
        lon: 24.94376,
        stop: {
          __dataID__: 'U3RvcDpIU0w6MTAyMDIwMQ==',
          gtfsId: 'HSL:1020201',
          stoptimes: [
            {
              __dataID__: 'client:-656622181260',
              pickupType: 'NONE',
              realtimeState: 'UPDATED',
              trip: {
                __dataID__: 'VHJpcDpIU0w6MTA3N18yMDE5MDIyNl9LZV8yXzE1MTI=',
                gtfsId: 'HSL:1077_20190226_Ke_2_1512',
                route: {
                  __dataID__: 'Um91dGU6SFNMOjEwNzc=',
                  shortName: '77',
                  gtfsId: 'HSL:1077',
                },
              },
              stop: {
                __dataID__: 'U3RvcDpIU0w6MTAyMDIwMQ==',
                gtfsId: 'HSL:1020201',
              },
            },
            {
              __dataID__: 'client:-656622181261',
              pickupType: 'NONE',
              realtimeState: 'UPDATED',
              trip: {
                __dataID__: 'VHJpcDpIU0w6MTA2NF8yMDE5MDIyNl9LZV8yXzE1MTc=',
                gtfsId: 'HSL:1064_20190226_Ke_2_1517',
                route: {
                  __dataID__: 'Um91dGU6SFNMOjEwNjQ=',
                  shortName: '64',
                  gtfsId: 'HSL:1064',
                },
              },
              stop: {
                __dataID__: 'U3RvcDpIU0w6MTAyMDIwMQ==',
                gtfsId: 'HSL:1020201',
              },
            },
            {
              __dataID__: 'client:-656622181262',
              pickupType: 'NONE',
              realtimeState: 'UPDATED',
              trip: {
                __dataID__: 'VHJpcDpIU0w6MTA3OF8yMDE5MDIyNl9LZV8yXzE1MTc=',
                gtfsId: 'HSL:1078_20190226_Ke_2_1517',
                route: {
                  __dataID__: 'Um91dGU6SFNMOjEwNzg=',
                  shortName: '78',
                  gtfsId: 'HSL:1078',
                },
              },
              stop: {
                __dataID__: 'U3RvcDpIU0w6MTAyMDIwMQ==',
                gtfsId: 'HSL:1020201',
              },
            },
            {
              __dataID__: 'client:-656622181263',
              pickupType: 'NONE',
              realtimeState: 'UPDATED',
              trip: {
                __dataID__: 'VHJpcDpIU0w6MTAyM18yMDE5MDIyNl9LZV8yXzE1MjE=',
                gtfsId: 'HSL:1023_20190226_Ke_2_1521',
                route: {
                  __dataID__: 'Um91dGU6SFNMOjEwMjM=',
                  shortName: '23',
                  gtfsId: 'HSL:1023',
                },
              },
              stop: {
                __dataID__: 'U3RvcDpIU0w6MTAyMDIwMQ==',
                gtfsId: 'HSL:1020201',
              },
            },
            {
              __dataID__: 'client:-656622181264',
              pickupType: 'NONE',
              realtimeState: 'UPDATED',
              trip: {
                __dataID__: 'VHJpcDpIU0w6MTA2Nl8yMDE5MDIyNl9LZV8yXzE1MjI=',
                gtfsId: 'HSL:1066_20190226_Ke_2_1522',
                route: {
                  __dataID__: 'Um91dGU6SFNMOjEwNjY=',
                  shortName: '66',
                  gtfsId: 'HSL:1066',
                },
              },
              stop: {
                __dataID__: 'U3RvcDpIU0w6MTAyMDIwMQ==',
                gtfsId: 'HSL:1020201',
              },
            },
          ],
          zoneId: '01',
        },
        bikeRentalStation: null,
      },
      to: {
        __dataID__: 'client:-65662218160',
        stop: null,
      },
    },
  ],
};

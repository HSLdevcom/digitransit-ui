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
            networks: ['smoove'],
          },
          stop: null,
        },
        to: {
          lat: 60.155309,
          lon: 24.9591271,
          name: 'Ehrenströmintie',
          vertexType: 'BIKESHARE',
          bikeRentalStation: {
            networks: ['smoove'],
          },
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
  walkDistance: 297.9158333249556,
  startTime: 1551272133000,
  endTime: 1551273985000,
  legs: [
    {
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
        name: 'Koskela, Helsinki',
        lat: 60.218765,
        lon: 24.968244,
        stop: null,
        bikeRentalStation: null,
      },
      to: {
        stop: {
          gtfsId: 'HSL:1260180',
          zoneId: '01',
        },
      },
    },
    {
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
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
        {
          stop: {
            zoneId: '01',
          },
        },
      ],
      route: {
        mode: 'BUS',
        shortName: '55',
        color: null,
        agency: {
          name: 'Helsingin seudun liikenne',
        },
      },
      trip: {
        alerts: [],
        stoptimes: [
          {
            stop: {
              gtfsId: 'HSL:1260108',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1260180',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1260104',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1270105',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1270102',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1230101',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1230103',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1230114',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1230112',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1240102',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1210163',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1210110',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1210114',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1210112',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1100119',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1100107',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1100122',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1100103',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1100149',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1111180',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1020106',
            },
            pickupType: 'SCHEDULED',
          },
          {
            stop: {
              gtfsId: 'HSL:1020201',
            },
            pickupType: 'NONE',
          },
        ],
      },
      from: {
        name: 'Antti Korpin tie',
        lat: 60.21839,
        lon: 24.96627,
        stop: {
          gtfsId: 'HSL:1260180',
          zoneId: '01',
        },
        bikeRentalStation: null,
      },
      to: {
        stop: {
          gtfsId: 'HSL:1020201',
          zoneId: '01',
        },
      },
    },
    {
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
        name: 'Rautatientori',
        lat: 60.17192,
        lon: 24.94376,
        stop: {
          gtfsId: 'HSL:1020201',
          stoptimes: [
            {
              pickupType: 'NONE',
              realtimeState: 'UPDATED',
              trip: {
                gtfsId: 'HSL:1077_20190226_Ke_2_1512',
                route: {
                  shortName: '77',
                  gtfsId: 'HSL:1077',
                },
              },
              stop: {
                gtfsId: 'HSL:1020201',
              },
            },
            {
              pickupType: 'NONE',
              realtimeState: 'UPDATED',
              trip: {
                gtfsId: 'HSL:1064_20190226_Ke_2_1517',
                route: {
                  shortName: '64',
                  gtfsId: 'HSL:1064',
                },
              },
              stop: {
                gtfsId: 'HSL:1020201',
              },
            },
            {
              pickupType: 'NONE',
              realtimeState: 'UPDATED',
              trip: {
                gtfsId: 'HSL:1078_20190226_Ke_2_1517',
                route: {
                  shortName: '78',
                  gtfsId: 'HSL:1078',
                },
              },
              stop: {
                gtfsId: 'HSL:1020201',
              },
            },
            {
              pickupType: 'NONE',
              realtimeState: 'UPDATED',
              trip: {
                gtfsId: 'HSL:1023_20190226_Ke_2_1521',
                route: {
                  shortName: '23',
                  gtfsId: 'HSL:1023',
                },
              },
              stop: {
                gtfsId: 'HSL:1020201',
              },
            },
            {
              pickupType: 'NONE',
              realtimeState: 'UPDATED',
              trip: {
                gtfsId: 'HSL:1066_20190226_Ke_2_1522',
                route: {
                  shortName: '66',
                  gtfsId: 'HSL:1066',
                },
              },
              stop: {
                gtfsId: 'HSL:1020201',
              },
            },
          ],
          zoneId: '01',
        },
        bikeRentalStation: null,
      },
      to: {
        stop: null,
      },
    },
  ],
};

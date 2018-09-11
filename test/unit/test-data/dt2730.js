export default {
  req: {
    query: {
      minTransferTime: '60',
      modes: 'BUS,TRAM,RAIL,SUBWAY,FERRY,WALK,CITYBIKE',
      time: '1536402426',
      transferPenalty: '0',
      walkBoardCost: '540',
      walkReluctance: '1.5',
      walkSpeed: '1.5',
    },
  },
  config: {
    cityBike: {
      showCityBikes: true,
      showStationId: true,
      useUrl: {
        fi: 'https://www.hsl.fi/kaupunkipyorat',
        sv: 'https://www.hsl.fi/sv/stadscyklar',
        en: 'https://www.hsl.fi/en/citybikes',
      },
      cityBikeMinZoom: 14,
      cityBikeSmallIconZoom: 14,
      fewAvailableCount: 3,
    },
    modeToOTP: {
      bus: 'BUS',
      tram: 'TRAM',
      rail: 'RAIL',
      subway: 'SUBWAY',
      citybike: 'BICYCLE_RENT',
      airplane: 'AIRPLANE',
      ferry: 'FERRY',
      walk: 'WALK',
      bicycle: 'BICYCLE',
      car: 'CAR',
      car_park: 'CAR_PARK',
    },
    transportModes: {
      bus: { availableForSelection: true, defaultValue: true },
      tram: { availableForSelection: true, defaultValue: true },
      rail: { availableForSelection: true, defaultValue: true },
      subway: { availableForSelection: true, defaultValue: true },
      citybike: { availableForSelection: true, defaultValue: false },
      airplane: { availableForSelection: false, defaultValue: false },
      ferry: { availableForSelection: true, defaultValue: true },
    },
    streetModes: {
      walk: {
        availableForSelection: true,
        defaultValue: true,
        icon: 'walk',
      },
      bicycle: {
        availableForSelection: true,
        defaultValue: false,
        icon: 'bicycle-withoutBox',
      },
      car: {
        availableForSelection: false,
        defaultValue: false,
        icon: 'car_park-withoutBox',
      },
      car_park: {
        availableForSelection: true,
        defaultValue: false,
        icon: 'car-withoutBox',
      },
    },
    customizeSearch: {
      walkReluctance: { available: true },
      walkBoardCost: { available: true },
      transferMargin: { available: true },
      walkingSpeed: { available: true },
      ticketOptions: { available: true },
      accessibility: { available: true },
      transferpenalty: { available: true },
    },
    redirectReittiopasParams: true,
    queryMaxAgeDays: 14,
    timezoneData:
      'Europe/Helsinki|EET EEST|-20 -30|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|35e5',
  },
};

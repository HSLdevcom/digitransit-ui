import { vi } from 'vitest';

const getStopAndStationsQuery = vi.fn();
const getFavouriteVehicleRentalStationsQuery = vi.fn();

vi.mock('@digitransit-search-util/digitransit-search-util-query-utils', () => ({
  getStopAndStationsQuery: (...args) => getStopAndStationsQuery(...args),
  getFavouriteVehicleRentalStationsQuery: (...args) =>
    getFavouriteVehicleRentalStationsQuery(...args),
}));

const stopFavourite = {
  type: 'stop',
  gtfsId: 'HSL:1234',
  favouriteId: 'stop-1',
};

const placeFavourite = {
  type: 'place',
  gid: 'openstreetmap:venue:node:1',
  favouriteId: 'place-1',
};

const bikeFavourite = {
  type: 'bikeStation',
  stationId: 'bike-1',
  networks: ['foo'],
  favouriteId: 'bike-1',
};

const resolvedBikeStation = { properties: { labelId: 'foo:bike-1' } };
const staleStopFavourite = {
  ...stopFavourite,
  gtfsId: 'HSL:removed',
  favouriteId: 'removed-stop',
};

// Flushes any pending microtasks (e.g. the Promise.all chain inside
// validateOtpLocationFavourites()). Uses only microtasks (no setImmediate/
// setTimeout) to stay independent of real/fake timer state.
const flushPromises = async () => {
  for (let i = 0; i < 10; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
};

describe('FavouriteData', () => {
  let favouriteStore;
  let STATUS_HAS_DATA;

  beforeEach(async () => {
    getStopAndStationsQuery.mockReset();
    getFavouriteVehicleRentalStationsQuery.mockReset();
    // FavouriteData's default export is a module-level singleton, and this
    // worker's test files share one module registry (see vitest.config.js
    // `isolate: false`). Reset modules and re-import for every test so each
    // test gets its own fresh instance, instead of sharing/racing against
    // whatever the app-wide singleton is doing in other test files.
    vi.resetModules();
    const favouriteDataModule = await import('../../../app/data/FavouriteData');
    favouriteStore = favouriteDataModule.default;
    STATUS_HAS_DATA = favouriteDataModule.STATUS_HAS_DATA;
    favouriteStore.init({
      allowLogin: true,
      vehicleRental: {
        networks: {
          foo: {
            type: 'citybike',
            enabled: true,
            season: { alwaysOn: true },
          },
          inactive: {
            type: 'citybike',
            enabled: true,
            season: { start: '1.1.2000', end: '2.1.2000' },
          },
          disabled: {
            type: 'citybike',
            enabled: false,
            season: { alwaysOn: true },
          },
        },
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateOtpLocationFavourites (revalidate=true, fresh backend fetch)', () => {
    it('sets hasOtpLocationFavourites to false immediately when there are no stop/station/bikeStation candidates', () => {
      favouriteStore.set([placeFavourite], true);

      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(false);
      expect(favouriteStore.getStatus()).toBe(STATUS_HAS_DATA);
      expect(getStopAndStationsQuery).not.toHaveBeenCalled();
    });

    it('sets hasOtpLocationFavourites to true once the live query resolves with matches', async () => {
      getStopAndStationsQuery.mockResolvedValue([stopFavourite]);
      getFavouriteVehicleRentalStationsQuery.mockResolvedValue([]);

      favouriteStore.set([stopFavourite], true);
      await flushPromises();

      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(true);
      expect(favouriteStore.getStatus()).toBe(STATUS_HAS_DATA);
    });

    it('sets hasOtpLocationFavourites to false once the live query resolves empty for every candidate', async () => {
      getStopAndStationsQuery.mockResolvedValue([]);
      getFavouriteVehicleRentalStationsQuery.mockResolvedValue([]);

      favouriteStore.set([stopFavourite], true);
      await flushPromises();

      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(false);
    });

    it('trusts the locally saved data (true) when the live query fails', async () => {
      getStopAndStationsQuery.mockRejectedValue(new Error('network error'));
      getFavouriteVehicleRentalStationsQuery.mockResolvedValue([]);

      favouriteStore.set([stopFavourite], true);
      await flushPromises();

      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(true);
    });

    it('counts a resolved bike station in an active network', async () => {
      getStopAndStationsQuery.mockResolvedValue([]);
      getFavouriteVehicleRentalStationsQuery.mockResolvedValue([
        resolvedBikeStation,
      ]);

      favouriteStore.set([bikeFavourite], true);
      await flushPromises();

      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(true);
    });

    it('applies season dates when reading cached bike-station availability', async () => {
      favouriteStore.config.vehicleRental.networks.foo.season = {
        start: '1.2.2026',
        end: '28.2.2026',
      };
      const now = vi
        .spyOn(Date, 'now')
        .mockReturnValue(new Date(2026, 1, 15).valueOf());
      getStopAndStationsQuery.mockResolvedValue([]);
      getFavouriteVehicleRentalStationsQuery.mockResolvedValue([
        resolvedBikeStation,
      ]);
      favouriteStore.set([bikeFavourite], true);
      await flushPromises();
      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(true);

      now.mockReturnValue(new Date(2026, 2, 2).valueOf());

      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(false);
      expect(getFavouriteVehicleRentalStationsQuery).toHaveBeenCalledTimes(1);
    });

    it.each(['inactive', 'disabled', 'unknown'])(
      'excludes bike stations in an %s network without querying OTP',
      network => {
        favouriteStore.set([{ ...bikeFavourite, networks: [network] }], true);

        expect(favouriteStore.getHasOtpLocationFavourites()).toBe(false);
        expect(getFavouriteVehicleRentalStationsQuery).not.toHaveBeenCalled();
        expect(favouriteStore.getStatus()).toBe(STATUS_HAS_DATA);
      },
    );

    it('does not count stale stops together with out-of-season bike stations', async () => {
      getStopAndStationsQuery.mockResolvedValue([]);
      getFavouriteVehicleRentalStationsQuery.mockResolvedValue([]);

      favouriteStore.set(
        [staleStopFavourite, { ...bikeFavourite, networks: ['inactive'] }],
        true,
      );
      await flushPromises();

      expect(getFavouriteVehicleRentalStationsQuery).toHaveBeenCalledWith(
        [],
        '',
      );
      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(false);
    });

    it('trusts only eligible bike stations when validation fails', async () => {
      getStopAndStationsQuery.mockResolvedValue([]);
      getFavouriteVehicleRentalStationsQuery.mockRejectedValue(
        new Error('network error'),
      );
      const inactiveBike = {
        ...bikeFavourite,
        networks: ['inactive'],
        favouriteId: 'inactive-bike',
      };

      favouriteStore.set([bikeFavourite, inactiveBike], true);
      await flushPromises();
      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(true);

      favouriteStore.set([inactiveBike]);
      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(false);
    });

    it('does not apply an old validation result after favourites change', async () => {
      let resolveStops;
      getStopAndStationsQuery.mockReturnValue(
        new Promise(resolve => {
          resolveStops = resolve;
        }),
      );
      getFavouriteVehicleRentalStationsQuery.mockResolvedValue([]);

      favouriteStore.set([stopFavourite], true);
      favouriteStore.set([]);
      resolveStops([stopFavourite]);
      await flushPromises();

      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(false);
    });
  });

  describe('updateHasOtpLocationFavouritesAfterLocalEdit (revalidate=false, local edit)', () => {
    it('does not query live data for local edits', () => {
      favouriteStore.set([placeFavourite], false);

      expect(getStopAndStationsQuery).not.toHaveBeenCalled();
      expect(getFavouriteVehicleRentalStationsQuery).not.toHaveBeenCalled();
    });

    it('flags true immediately when a new stop/station/bikeStation favourite is added locally', () => {
      favouriteStore.set([placeFavourite], false);
      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(false);

      favouriteStore.set([placeFavourite, stopFavourite], false);
      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(true);
      expect(getStopAndStationsQuery).not.toHaveBeenCalled();
    });

    it('flags false when the last stop/station/bikeStation favourite is removed locally', () => {
      favouriteStore.set([placeFavourite, stopFavourite], false);
      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(true);

      favouriteStore.set([placeFavourite], false);
      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(false);
    });

    it('keeps validation for unchanged locations after an unrelated edit', () => {
      favouriteStore.set([placeFavourite, stopFavourite], false);
      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(true);

      favouriteStore.set([stopFavourite], false);
      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(true);
    });

    it('does not count an out-of-season bike station added locally', () => {
      favouriteStore.set([{ ...bikeFavourite, networks: ['inactive'] }]);

      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(false);
    });

    it('counts an active bike station added locally', () => {
      favouriteStore.set([bikeFavourite]);

      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(true);
    });

    it('hides favourites after deleting the last resolved location while stale ones remain', async () => {
      getStopAndStationsQuery.mockResolvedValue([stopFavourite]);
      getFavouriteVehicleRentalStationsQuery.mockResolvedValue([]);
      favouriteStore.set([stopFavourite, staleStopFavourite], true);
      await flushPromises();
      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(true);

      favouriteStore.set([staleStopFavourite]);

      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(false);
    });

    it('clears cached availability when favourites are cleared', () => {
      favouriteStore.set([stopFavourite]);
      favouriteStore.clearFavourites();

      expect(favouriteStore.getHasOtpLocationFavourites()).toBe(false);
    });
  });
});

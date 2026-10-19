import fetchTicketPrices, {
  processTicketTypeResult,
} from '../../../../server/services/ticketPrices';

const { retryFetch } = vi.hoisted(() => ({ retryFetch: vi.fn() }));
vi.mock('../../../../utils/shared/fetchUtils', () => ({ retryFetch }));

const ticketTypesResponse = {
  json: async () => ({
    data: { ticketTypes: [{ fareId: 'HSL:esim', price: 2.8, zones: ['A'] }] },
  }),
};

describe('ticketPrices', () => {
  describe('processTicketTypeResult', () => {
    it('patches ticket prices into config.availableTickets by feed and fareId', () => {
      const config = { availableTickets: {} };
      const result = {
        data: {
          ticketTypes: [
            { fareId: 'HSL:esim', price: 2.8, zones: ['A', 'B'] },
            { fareId: 'HSL:toinen', price: 5.7, zones: ['A', 'B', 'C'] },
          ],
        },
      };

      processTicketTypeResult(result, config);

      expect(config.availableTickets.HSL).toEqual({
        'HSL:esim': { price: 2.8, zones: ['A', 'B'] },
        'HSL:toinen': { price: 5.7, zones: ['A', 'B', 'C'] },
      });
    });

    it('does nothing when config has no availableTickets object', () => {
      const config = {};
      processTicketTypeResult({ data: { ticketTypes: [] } }, config);
      expect(config.availableTickets).toBeUndefined();
    });

    it('does not throw when the result payload is malformed', () => {
      const config = { availableTickets: {} };
      expect(() => processTicketTypeResult({ data: {} }, config)).not.toThrow();
      expect(config.availableTickets).toEqual({});
    });
  });

  describe('fetchTicketPrices (default export)', () => {
    const config = () => ({
      URL: { OTP: 'https://otp/' },
      availableTickets: {},
    });

    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('patches the fetched ticket prices into config before resolving', async () => {
      retryFetch.mockResolvedValue(ticketTypesResponse);
      const conf = config();

      await fetchTicketPrices(conf);

      expect(conf.availableTickets.HSL['HSL:esim'].price).toBe(2.8);
    });

    it('exits the process when the fetch fails and BASE_CONFIG is set', async () => {
      vi.stubEnv('BASE_CONFIG', 'hsl');
      retryFetch.mockRejectedValue(new Error('down'));
      const exit = vi.spyOn(process, 'exit').mockImplementation(() => {});

      await fetchTicketPrices(config());

      expect(exit).toHaveBeenCalledWith(1);
    });

    it('resolves without prices when the fetch fails, then keeps retrying in the background', async () => {
      vi.stubEnv('BASE_CONFIG', '');
      // The background retry stays pending until resolved below, so this
      // test would time out if fetchTicketPrices awaited it.
      let resolveBackgroundRetry;
      retryFetch.mockRejectedValueOnce(new Error('down')).mockReturnValueOnce(
        new Promise(resolve => {
          resolveBackgroundRetry = resolve;
        }),
      );
      const conf = config();

      await fetchTicketPrices(conf);

      expect(conf.availableTickets).toEqual({});
      expect(retryFetch).toHaveBeenLastCalledWith(
        'https://otp/gtfs/v1',
        1440,
        60000,
        expect.any(Object),
      );
      resolveBackgroundRetry(ticketTypesResponse);
      await vi.waitFor(() =>
        expect(conf.availableTickets.HSL['HSL:esim'].price).toBe(2.8),
      );
    });
  });
});

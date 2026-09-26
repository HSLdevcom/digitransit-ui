import { processTicketTypeResult } from '../../../../server/services/ticketPrices';

// Only the pure transform is tested here - the default export
// (fetchTicketPrices) performs real network calls with retries and, on
// repeated failure with BASE_CONFIG set, calls process.exit(1), so it isn't
// safe to invoke from a unit test.
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
});

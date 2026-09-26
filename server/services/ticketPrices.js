/* eslint-disable no-param-reassign, no-console */
import { retryFetch } from '../../utils/shared/fetchUtils.js';
import { splitGtfsId } from '../../utils/shared/gtfs.js';

export function processTicketTypeResult(result, config) {
  const resultData = result.data;
  if (config.availableTickets) {
    if (resultData && Array.isArray(resultData.ticketTypes)) {
      resultData.ticketTypes.forEach(ticket => {
        const { feedId: ticketFeed } = splitGtfsId(ticket.fareId);
        if (config.availableTickets[ticketFeed] === undefined) {
          config.availableTickets[ticketFeed] = {};
        }
        config.availableTickets[ticketFeed][ticket.fareId] = {
          price: ticket.price,
          zones: ticket.zones,
        };
      });
      console.log('availableTickets loaded');
    } else {
      console.log('could not load availableTickets, result was invalid');
    }
  } else {
    console.log(
      'availableTickets not loaded, missing availableTickets object from config-file',
    );
  }
}

async function fetchTicketTypes(url, retryCount, retryDelay, options) {
  const res = await retryFetch(url, retryCount, retryDelay, options);
  return res.json();
}

/**
 * Fetches available ticket prices from OTP at boot and patches them into
 * `config.availableTickets`, so the resolved config object server-wide picks
 * up the values once this promise settles.
 *
 * @param {object} config the resolved config - mutated in place.
 */
export default async function fetchTicketPrices(config) {
  const options = {
    method: 'POST',
    body: '{ ticketTypes { price fareId zones } }',
    headers: { 'Content-Type': 'application/graphql' },
  };
  const queryParameters = config.hasAPISubscriptionQueryParameter
    ? `?${config.API_SUBSCRIPTION_QUERY_PARAMETER_NAME}=${config.API_SUBSCRIPTION_TOKEN}`
    : '';
  const url = `${config.URL.OTP}gtfs/v1${queryParameters}`;

  try {
    // try to fetch available ticketTypes every four seconds with 4 retries
    const result = await fetchTicketTypes(url, 4, 4000, options);
    processTicketTypeResult(result, config);
  } catch (err) {
    console.log(err);
    if (process.env.BASE_CONFIG) {
      // Patching of availableTickets into cached configs would not work with BASE_CONFIG
      // if availableTickets are fetched after launch
      console.log('failed to load availableTickets at launch, exiting');
      process.exit(1);
    }
    // If after 5 tries no available ticketTypes are found, start server anyway
    console.log('failed to load availableTickets at launch, retrying');
    // Continue attempts to fetch available ticketTypes in the background for
    // one day once every minute - deliberately not awaited, so the server
    // starts without waiting for it.
    fetchTicketTypes(url, 1440, 60000, options)
      .then(result => processTicketTypeResult(result, config))
      .catch(error => console.log(error));
  }
}

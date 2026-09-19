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

// Fetches available ticket prices from OTP at boot and patches them into
// `config.availableTickets` in place, so the resolved config object
// server-wide picks up the values once this promise settles.
export default function fetchTicketPrices(config) {
  return new Promise(resolve => {
    const options = {
      method: 'POST',
      body: '{ ticketTypes { price fareId zones } }',
      headers: { 'Content-Type': 'application/graphql' },
    };
    const queryParameters = config.hasAPISubscriptionQueryParameter
      ? `?${config.API_SUBSCRIPTION_QUERY_PARAMETER_NAME}=${config.API_SUBSCRIPTION_TOKEN}`
      : '';
    // try to fetch available ticketTypes every four seconds with 4 retries
    retryFetch(`${config.URL.OTP}gtfs/v1${queryParameters}`, 4, 4000, options)
      .then(res => res.json())
      .then(
        result => {
          processTicketTypeResult(result, config);
          resolve();
        },
        err => {
          console.log(err);
          if (process.env.BASE_CONFIG) {
            // Patching of availableTickets into cached configs would not work with BASE_CONFIG
            // if availableTickets are fetched after launch
            console.log('failed to load availableTickets at launch, exiting');
            process.exit(1);
          } else {
            // If after 5 tries no available ticketTypes are found, start server anyway
            resolve();
            console.log('failed to load availableTickets at launch, retrying');
            // Continue attempts to fetch available ticketTypes in the background for one day once every minute
            retryFetch(
              `${config.URL.OTP}gtfs/v1${queryParameters}`,
              1440,
              60000,
              options,
            )
              .then(res => res.json())
              .then(
                result => {
                  processTicketTypeResult(result, config);
                },
                error => {
                  console.log(error);
                },
              );
          }
        },
      );
  });
}

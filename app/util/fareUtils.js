// returns null or non-empty array of localized ticket names
export default function mapFares(fares, config, lang) {
  if (!Array.isArray(fares) || !config.showTicketInformation) {
    return null;
  }

  const [regularFare] = fares.filter(fare => fare.type === 'regular');
  if (!regularFare) {
    return null;
  }

  const { components } = regularFare;
  if (!Array.isArray(components) || components.length === 0) {
    return null;
  }

  return components.map(fare => ({
    ...fare,
    ticketName: config.fareMapping(fare.fareId, lang),
  }));
}

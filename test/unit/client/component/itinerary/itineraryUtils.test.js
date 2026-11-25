import { getItineraryScreenReaderText } from '../../../../../src/client/component/itinerary/itineraryUtils';

describe('getItineraryScreenReaderText', () => {
  const intl = { formatMessage: ({ id }, values = {}) => `[${id} ${JSON.stringify(values)}]` };
  const params = { actionHint: 'open', hasCallAgencyLeg: true, vehicleNames: [], stopNames: [] };

  it('joins the description, co2 and action hint into one text', () => {
    expect(getItineraryScreenReaderText(intl, { ...params, co2value: 120 })).toBe(
      '[itinerary-summary-row.call-agency-description {}]. ' +
        '[itinerary-co2.description-simple {"co2value":120}]. ' +
        '[itinerary-summary-row.hint-open {}]',
    );
  });

  it('leaves out co2 when it is not shown', () => {
    expect(getItineraryScreenReaderText(intl, { ...params, co2value: null })).not.toContain('co2');
    expect(getItineraryScreenReaderText(intl, params)).not.toContain('co2');
  });

  it.each(['open', 'select', 'selected'])('ends with the %s hint', hint => {
    expect(getItineraryScreenReaderText(intl, { ...params, actionHint: hint })).toMatch(
      new RegExp(`\\[itinerary-summary-row.hint-${hint} \\{\\}\\]$`),
    );
  });
});

import { getItineraryScreenReaderText } from '../../../../../src/client/component/itinerary/itineraryUtils';

describe('getItineraryScreenReaderText', () => {
  const intl = { formatMessage: ({ id }, values = {}) => `[${id} ${JSON.stringify(values)}]` };
  const params = { rowNumber: 2, hasCallAgencyLeg: true, vehicleNames: [], stopNames: [] };

  it('joins the row label, description and co2 into one text', () => {
    expect(getItineraryScreenReaderText(intl, { ...params, co2value: 120 })).toBe(
      '[summary-page.row-label {"number":2}] [itinerary-summary-row.call-agency-description {}] ' +
        '[itinerary-co2.description-simple {"co2value":120}]',
    );
  });

  it('leaves out co2 when it is not shown', () => {
    expect(getItineraryScreenReaderText(intl, { ...params, co2value: null })).not.toContain('co2');
    expect(getItineraryScreenReaderText(intl, params)).not.toContain('co2');
  });
});

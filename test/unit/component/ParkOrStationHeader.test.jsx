import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/mock-providers';
import { createTestConfig } from '../helpers/mock-context';
import ParkOrStationHeader from '../../../app/component/ParkOrStationHeader';

describe('<ParkOrStationHeader />', () => {
  beforeAll(() => fetchMock.mockGlobal());

  afterEach(() => {
    fetchMock.removeRoutes();
    fetchMock.clearHistory();
  });

  afterAll(() => fetchMock.unmockGlobal());

  it('reverse-geocodes using the configured Pelias URL and search params', async () => {
    const config = createTestConfig({
      searchParams: { 'boundary.country': 'FI' },
    });
    const peliasMatcher = {
      url: `begin:${config.URL.PELIAS_REVERSE_GEOCODER}`,
    };
    fetchMock.get(peliasMatcher, { features: [] });

    renderWithProviders(
      <ParkOrStationHeader
        parkOrStation={{ name: 'Test park', lat: 60.1, lon: 24.9 }}
      />,
      { config },
    );

    // Match on the Pelias URL specifically, not "any" fetch call - under
    // isolate: false a stray fetch from an unrelated test file sharing this
    // worker can otherwise be the first entry in the global call history.
    await waitFor(() =>
      expect(fetchMock.callHistory.called(peliasMatcher)).toBe(true),
    );
    const { url } = fetchMock.callHistory.calls(peliasMatcher)[0];
    expect(url).toContain(config.URL.PELIAS_REVERSE_GEOCODER);
    expect(url).toContain('boundary.country=FI');
  });
});

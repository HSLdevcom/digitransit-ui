import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import DTAutosuggestPanel from './src/index.js';

// searchContext's sources/targets being empty means "search all sources",
// which includes a real geocoding lookup via axios - mock it so tests that
// type into a field don't fire an actual network request against the fake
// URL_PELIAS host below.
vi.mock('axios', () => ({
  default: { get: vi.fn(() => Promise.resolve({ data: { features: [] } })) },
}));

// Minimal but complete searchContext stub - see
// digitransit-search-util-execute-search-immidiate/test.js for the equivalent
// note on why every field needs to be something callable/iterable.
const searchContext = {
  getPositions: () => ({}),
  getFavouriteLocations: () => [],
  getOldSearches: () => [],
  getFavouriteStops: () => [],
  parkingAreaSources: [],
  getLanguage: () => 'en',
  getStopAndStationsQuery: () => Promise.resolve([]),
  getFavouriteVehicleRentalStationsQuery: () => Promise.resolve([]),
  getFavouriteVehicleRentalStations: () => [],
  getFavouriteRoutesQuery: () => Promise.resolve([]),
  getFavouriteRoutes: () => [],
  getRoutesQuery: () => Promise.resolve([]),
  context: {},
  isPeliasLocationAware: false,
  minimalRegexp: undefined,
  lineRegexp: undefined,
  URL_PELIAS: 'https://example.invalid/geocoding',
  URL_PELIAS_PLACE: 'https://example.invalid/place',
  feedIDs: [],
  geocodingSearchParams: {},
  geocodingSources: [],
  getFutureRoutes: () => [],
  cityBikeNetworks: [],
};

function renderPanel(props) {
  return render(
    <DTAutosuggestPanel
      appElement="#app"
      searchContext={searchContext}
      onSelect={() => {}}
      lang="en"
      {...props}
    />,
  );
}

describe('Testing @digitransit-component/digitransit-component-autosuggest-panel module', () => {
  it('renders both an origin and a destination search field', () => {
    renderPanel();
    const [origin, destination] = screen.getAllByRole('combobox');
    expect(origin.id).toBe('origin');
    expect(destination.id).toBe('destination');
  });

  it('shows the already-selected origin and destination addresses', () => {
    renderPanel({
      origin: { address: 'Pasila, Helsinki', lat: 60.2, lon: 24.9 },
      destination: { address: 'Myyrmäki, Vantaa', lat: 60.26, lon: 24.85 },
    });
    const [origin, destination] = screen.getAllByRole('combobox');
    expect(origin.value).toBe('Pasila, Helsinki');
    expect(destination.value).toBe('Myyrmäki, Vantaa');
  });

  it('lets the user type into the destination field without crashing', async () => {
    renderPanel();
    const [, destination] = screen.getAllByRole('combobox');
    fireEvent.change(destination, { target: { value: 'Myyr' } });
    expect(destination.value).toBe('Myyr');
    // Let the mocked geocoding search resolve and its resulting dispatch
    // land before the test ends and unmounts the component.
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  });
});

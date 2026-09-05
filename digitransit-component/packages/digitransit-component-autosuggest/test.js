import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import DTAutosuggest from './src/index.js';

// searchContext's sources/targets being empty means "search all sources",
// which includes a real geocoding lookup via axios - mock it so tests that
// type into the input don't fire an actual network request against the
// fake URL_PELIAS host below.
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

function renderAutosuggest(props) {
  return render(
    <DTAutosuggest
      appElement="#app"
      id="origin"
      placeholder="give-origin"
      onSelect={() => {}}
      value=""
      lang="en"
      searchContext={searchContext}
      sources={[]}
      targets={[]}
      {...props}
    />,
  );
}

describe('Testing @digitransit-component/digitransit-component-autosuggest module', () => {
  it('renders a combobox input with the translated placeholder', () => {
    renderAutosuggest();
    const input = screen.getByRole('combobox');
    expect(input.placeholder).toBe('Enter your origin.');
  });

  it('renders the given initial value in the input', () => {
    renderAutosuggest({ value: 'Pasila' });
    expect(screen.getByRole('combobox').value).toBe('Pasila');
  });

  it('updates the input value as the user types', async () => {
    renderAutosuggest();
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Pasi' } });
    expect(input.value).toBe('Pasi');
    // Let the mocked geocoding search resolve and its resulting dispatch
    // land before the test ends and unmounts the component.
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  });
});

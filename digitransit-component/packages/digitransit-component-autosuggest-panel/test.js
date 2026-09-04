import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DTAutosuggestPanelModule from './lib/index.cjs';

// Node's CJS/ESM interop binds a default import to the whole UMD `exports`
// object, not `.default` - cjs-module-lexer can't see named exports through
// Rollup's UMD factory indirection to unwrap it automatically.
const DTAutosuggestPanel = DTAutosuggestPanelModule.default;

// test.js runs as plain native ESM (no Babel at test time), so JSX isn't
// available here: use React.createElement directly instead.
const h = React.createElement;

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
    h(DTAutosuggestPanel, {
      appElement: '#app',
      searchContext,
      onSelect: () => {},
      lang: 'en',
      ...props,
    }),
  );
}

describe('Testing @digitransit-component/digitransit-component-autosuggest-panel module', () => {
  it('renders both an origin and a destination search field', () => {
    renderPanel();
    const [origin, destination] = screen.getAllByRole('combobox');
    expect(origin.id).to.equal('origin');
    expect(destination.id).to.equal('destination');
  });

  it('shows the already-selected origin and destination addresses', () => {
    renderPanel({
      origin: { address: 'Pasila, Helsinki', lat: 60.2, lon: 24.9 },
      destination: { address: 'Myyrmäki, Vantaa', lat: 60.26, lon: 24.85 },
    });
    const [origin, destination] = screen.getAllByRole('combobox');
    expect(origin.value).to.equal('Pasila, Helsinki');
    expect(destination.value).to.equal('Myyrmäki, Vantaa');
  });

  it('lets the user type into the destination field without crashing', () => {
    renderPanel();
    const [, destination] = screen.getAllByRole('combobox');
    fireEvent.change(destination, { target: { value: 'Myyr' } });
    expect(destination.value).to.equal('Myyr');
  });
});

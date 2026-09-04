/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { render, screen } from '@testing-library/react';
import SuggestionItemModule from './lib/index.cjs';

// Node's CJS/ESM interop binds a default import to the whole UMD `exports`
// object, not `.default` - cjs-module-lexer can't see named exports through
// Rollup's UMD factory indirection to unwrap it automatically.
const SuggestionItem = SuggestionItemModule.default;

// test.js runs as plain native ESM (no Babel at test time), so JSX isn't
// available here: use React.createElement directly instead.
const h = React.createElement;

describe('Testing @digitransit-component/digitransit-component-suggestion-item module', () => {
  it('renders a geocoded address suggestion with name and label', () => {
    const item = {
      type: 'Address',
      name: 'Mannerheimintie 1',
      address: 'Mannerheimintie 1, Helsinki',
      properties: { layer: 'address' },
    };
    render(
      h(SuggestionItem, {
        item,
        content: ['Osoite', 'Mannerheimintie 1', 'Helsinki'],
      }),
    );
    expect(screen.getByText('Mannerheimintie 1')).to.exist;
    expect(screen.getByText('Helsinki')).to.exist;
  });

  it('renders a favourite place using only its name', () => {
    const item = {
      type: 'FavouritePlace',
      name: 'Home',
      address: 'Kotikatu 1, Helsinki',
      selectedIconId: 'icon-icon_home',
      properties: { layer: 'favouritePlace' },
    };
    render(
      h(SuggestionItem, {
        item,
        content: ['Suosikki', 'Home', 'Kotikatu 1, Helsinki'],
        colors: { primary: '#0074bf' },
      }),
    );
    expect(screen.getByText('Home')).to.exist;
  });

  it('renders a stop suggestion with its stop code shown separately from the name', () => {
    const item = {
      type: 'Stop',
      properties: { layer: 'stop', id: '1234' },
    };
    render(
      h(SuggestionItem, {
        item,
        content: ['Pysäkki', 'Rautatientori', 'Helsinki', '1234'],
      }),
    );
    expect(screen.getByText('Rautatientori')).to.exist;
    expect(screen.getByText('1234')).to.exist;
  });

  it('renders a future route suggestion with both origin and destination names', () => {
    const item = {
      type: 'FutureRoute',
      translatedText: 'Coming Friday',
      properties: {
        layer: 'futureRoute',
        origin: { name: 'Pasila', localadmin: 'Helsinki' },
        destination: { name: 'Myyrmäki', localadmin: 'Vantaa' },
      },
    };
    render(h(SuggestionItem, { item, content: ['Tuleva reitti'] }));
    expect(screen.getByText('Pasila')).to.exist;
    expect(screen.getByText('Myyrmäki')).to.exist;
    expect(screen.getByText('Coming Friday')).to.exist;
  });
});

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import SuggestionItem from './src/index.js';

describe('Testing @digitransit-component/digitransit-component-suggestion-item module', () => {
  it('renders a geocoded address suggestion with name and label', () => {
    const item = {
      type: 'Address',
      name: 'Mannerheimintie 1',
      address: 'Mannerheimintie 1, Helsinki',
      properties: { layer: 'address' },
    };
    render(
      <SuggestionItem
        item={item}
        content={['Osoite', 'Mannerheimintie 1', 'Helsinki']}
      />,
    );
    expect(screen.getByText('Mannerheimintie 1')).toBeTruthy();
    expect(screen.getByText('Helsinki')).toBeTruthy();
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
      <SuggestionItem
        item={item}
        content={['Suosikki', 'Home', 'Kotikatu 1, Helsinki']}
        colors={{ primary: '#0074bf' }}
      />,
    );
    expect(screen.getByText('Home')).toBeTruthy();
  });

  it('renders a stop suggestion with its stop code shown separately from the name', () => {
    const item = {
      type: 'Stop',
      properties: { layer: 'stop', id: '1234' },
    };
    render(
      <SuggestionItem
        item={item}
        content={['Pysäkki', 'Rautatientori', 'Helsinki', '1234']}
      />,
    );
    expect(screen.getByText('Rautatientori')).toBeTruthy();
    expect(screen.getByText('1234')).toBeTruthy();
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
    render(<SuggestionItem item={item} content={['Tuleva reitti']} />);
    expect(screen.getByText('Pasila')).toBeTruthy();
    expect(screen.getByText('Myyrmäki')).toBeTruthy();
    expect(screen.getByText('Coming Friday')).toBeTruthy();
  });
});

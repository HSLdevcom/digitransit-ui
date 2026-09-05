import { describe, it, expect } from 'vitest';
import getLabel from './index.js';

describe('Testing @digitransit-search-util/digitransit-search-util-get-label module', () => {
  it('joins name and address for a plain address suggestion', () => {
    const label = getLabel({
      layer: 'address',
      name: 'Mannerheimintie 1',
      label: 'Mannerheimintie 1, Helsinki',
    });
    expect(label).toBe('Mannerheimintie 1, Helsinki');
  });

  it('returns only the address for a current-position suggestion', () => {
    const label = getLabel({
      layer: 'currentPosition',
      labelId: 'use-own-position',
      address: 'My location',
    });
    expect(label).toBe('My location');
  });

  it('returns only the name for a favourite place', () => {
    const label = getLabel({
      layer: 'favouritePlace',
      name: 'Home',
      address: 'Home, Helsinki',
    });
    expect(label).toBe('Home');
  });
});

import { describe, it, expect } from 'vitest';
import { getItem, getItemAsJson, removeItem, setItem } from './src/index.js';
import './mock-localstorage.js';

describe('Testing @digitransit-store/digitransit-store-common-functions', () => {
  describe('getItem', () => {
    it('should return null', () => {
      const item = getItem('digitransit-store-test');
      expect(item).toBeNull();
    });
  });

  describe('getItemAsJson', () => {
    it('should return []', () => {
      const item = getItemAsJson('digitransit-store-test');
      expect(JSON.stringify(item)).toBe('[]');
    });
  });

  describe('setItem', () => {
    const newItem = {
      items: [
        { name: 'name1', value: 'value1' },
        { name: 'name2', value: 'value2' },
      ],
    };
    it('should add two items', () => {
      setItem('digitransit-store-test', newItem);
      const item = getItemAsJson('digitransit-store-test');
      expect(item).toHaveProperty('items');
      expect(item.items).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('should remove existing item', () => {
      removeItem('digitransit-store-test');
      const item = getItem('digitransit-store-test');
      expect(item).toBeNull();
    });
  });
});

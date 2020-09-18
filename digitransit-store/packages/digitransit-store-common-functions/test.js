/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  getItem,
  getItemAsJson,
  removeItem,
  setItem,
} from '@digitransit-store/digitransit-store-common-functions';
import './mock-localstorage';

describe('Testing @digitransit-store/digitransit-store-common-functions', () => {
  describe('getItem', () => {
    it('should return null', () => {
      const item = getItem('digitransit-store-test');
      expect(item).to.be.null;
    });
  });

  describe('getItemAsJson', () => {
    it('should return []', () => {
      const item = getItemAsJson('digitransit-store-test');
      expect(JSON.stringify(item)).to.equal('[]');
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
      expect(item).to.have.property('items').with.lengthOf(2);
    });
  });

  describe('removeItem', () => {
    it('should remove existing item', () => {
      removeItem('digitransit-store-test');
      const item = getItem('digitransit-store-test');
      expect(item).to.be.null;
    });
  });
});

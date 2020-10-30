import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import {
  getLocalStorage,
  getCustomizedSettings,
  setCustomizedSettings,
  getReadMessageIds,
  setReadMessageIds,
} from '../../app/store/localStorage';
import defaultConfig from '../../app/configurations/config.default';

describe('localStorage', () => {
  describe('getCustomizedSettings', () => {
    it('should return an empty object by default', () => {
      expect(getCustomizedSettings()).to.deep.equal({});
    });
  });

  describe('setCustomizedSettings', () => {
    it('should save all default settings', () => {
      const defaultSettings = { ...defaultConfig.defaultSettings };
      setCustomizedSettings(defaultSettings);
      expect(getCustomizedSettings()).to.deep.equal(defaultSettings);
    });
  });

  describe('getLocalStorage', () => {
    it('should invoke the given errorHandler if in browser and localStorage throws', () => {
      const handler = sinon.stub();
      const stub = sinon.stub(window, 'localStorage').get(() => {
        throw new DOMException();
      });
      getLocalStorage(true, handler);
      expect(handler.called).to.equal(true);
      stub.restore();
    });

    it('should return null if thrown exception was a SecurityError and it was handled by default', () => {
      const stub = sinon.stub(window, 'localStorage').get(() => {
        throw new DOMException('Foo', 'SecurityError');
      });
      const result = getLocalStorage(true);
      expect(result).to.equal(null);
      stub.restore();
    });

    it('should return window.localStorage if in browser', () => {
      const result = getLocalStorage(true);
      expect(result).to.equal(window.localStorage);
    });

    it('should return global.localStorage if not in browser', () => {
      const result = getLocalStorage(false);
      expect(result).to.equal(global.localStorage);
    });
  });
  describe('getReadMessageIds', () => {
    it('result should be empty array', () => {
      const result = getReadMessageIds();
      // eslint-disable-next-line no-unused-expressions
      expect(result).to.be.empty;
    });
    it('result should be "1"', () => {
      window.localStorage.setItem('readMessages', JSON.stringify(1));
      const result = getReadMessageIds();
      expect(result).to.equal(JSON.parse('1'));
    });
  });

  describe('setReadMessageIds', () => {
    it('result should be ["1"]', () => {
      setReadMessageIds(['1']);
      const result = window.localStorage.getItem('readMessages');
      expect(result).to.equal('["1"]');
    });
  });
});

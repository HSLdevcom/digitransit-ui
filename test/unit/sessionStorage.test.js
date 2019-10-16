import { expect } from 'chai';
import sinon from 'sinon';
import {
  getSessionStorage,
  getSessionMessageIds,
  setSessionMessageIds,
} from '../../app/store/sessionStorage';

describe('sessionStorage', () => {
  describe('getSessionStorage', () => {
    it('should invoke the given errorHandler if in browser and sessionStorage throws', () => {
      const handler = sinon.stub();
      const stub = sinon.stub(window, 'sessionStorage').get(() => {
        throw new DOMException();
      });
      getSessionStorage(true, handler);
      expect(handler.called).to.equal(true);
      stub.restore();
    });

    it('should return null if thrown exception was a SecurityError and it was handled by default', () => {
      const stub = sinon.stub(window, 'sessionStorage').get(() => {
        throw new DOMException('Foo', 'SecurityError');
      });
      const result = getSessionStorage(true);
      expect(result).to.equal(null);
      stub.restore();
    });

    it('should return window.sessionStorage if in browser', () => {
      const result = getSessionStorage(true);
      expect(result).to.equal(window.sessionStorage);
    });

    it('should return global.sessionStorage if not in browser', () => {
      const result = getSessionStorage(false);
      expect(result).to.equal(global.sessionStorage);
    });
  });

  describe('getSessionMessageIds', () => {
    it('result should be empty array', () => {
      const result = getSessionMessageIds();
      // eslint-disable-next-line no-unused-expressions
      expect(result).to.be.empty;
    });
    it('result should be "1"', () => {
      window.sessionStorage.setItem('messages', JSON.stringify(1));
      const result = getSessionMessageIds();
      expect(result).to.equal(JSON.parse('1'));
    });
  });

  describe('setSessionMessageIds', () => {
    it('result should be ["1"]', () => {
      setSessionMessageIds(['1']);
      const result = window.sessionStorage.getItem('messages');
      expect(result).to.equal('["1"]');
    });
  });
});

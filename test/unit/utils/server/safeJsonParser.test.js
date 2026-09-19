import { expect } from 'chai';
import { describe, it } from 'mocha';
import safeJsonParse from '../../../../utils/server/safeJsonParser';

describe('safeJsonParser', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"a": 1}')).to.deep.equal({ a: 1 });
  });

  it('returns undefined for invalid JSON instead of throwing', () => {
    expect(safeJsonParse('not json')).to.be.undefined; // eslint-disable-line no-unused-expressions
  });

  it('returns undefined for undefined input', () => {
    expect(safeJsonParse(undefined)).to.be.undefined; // eslint-disable-line no-unused-expressions
  });
});

import safeJsonParse from '../../../../utils/server/safeJsonParser';

describe('safeJsonParser', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"a": 1}')).toEqual({ a: 1 });
  });

  it('returns undefined for invalid JSON instead of throwing', () => {
    expect(safeJsonParse('not json')).toBeUndefined();
  });

  it('returns undefined for undefined input', () => {
    expect(safeJsonParse(undefined)).toBeUndefined();
  });
});

import { describe, it, expect } from 'vitest';
import * as digitransitUtil from '../index.js';

describe('@digitransit-util/digitransit-util', () => {
  it('exports every helper as a function', () => {
    const expected = [
      'dayRangeAllowedDiff',
      'dayRangePattern',
      'distance',
      'enrichPatterns',
      'filterMatchingToInput',
      'formatFavouritePlaceLabel',
      'getGeocodingResults',
      'getGtfsId',
      'getJson',
      'getLabel',
      'getLayerRank',
      'getMatchScore',
      'getNameLabel',
      'getStopCode',
      'getStopName',
      'isDuplicate',
      'isKeyboardSelectionEvent',
      'isStop',
      'mapRoute',
      'postJson',
      'routeNameCompare',
      'serialize',
      'sortSearchResults',
      'suggestionToLocation',
      'uniqueByLabel',
    ];
    expect(Object.keys(digitransitUtil).sort()).toEqual(expected);
    expected.forEach(name =>
      expect(typeof digitransitUtil[name]).toBe('function'),
    );
  });
});

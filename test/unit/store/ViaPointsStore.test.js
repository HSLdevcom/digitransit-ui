import { expect } from 'chai';
import { describe, it } from 'mocha';

import ViaPointsStore from '../../../app/store/ViaPointsStore';

describe('ViaPointsStore', () => {
  it('Should update the updateViapoints call', () => {
    const store = new ViaPointsStore();
    store.updateViaPointsFromMap(true);
    expect(store.getViaPoints()).to.deep.equal(true);
  });
});

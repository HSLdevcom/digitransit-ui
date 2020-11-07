import { expect } from 'chai';
import { describe, it } from 'mocha';

import ViaPointStore from '../../../app/store/ViaPointStore';

describe('ViaPointsStore', () => {
  it('Should store via points', () => {
    const store = new ViaPointStore();
    store.addViaPoint({ via: 'point' });
    expect(store.getViaPoints()[0].via).to.deep.equal('point');
  });
});

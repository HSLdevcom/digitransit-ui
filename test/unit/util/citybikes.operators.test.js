//  yarn mocha --file test/unit/helpers/babel-register.js  --file test/unit/helpers/init.js   test/unit/util/citybikes.operators.test.js
import { getSharingOperatorsByFormFactor } from '../../../app/util/citybikes';

describe('citybikes.operators', () => {
  describe('getSharingOperatorsByFormFactor', () => {
    it('should return the default operator if none is specified', () => {
      const config = {
        cityBike: {
          networks: {
            foobar: {
              icon: 'citybike',
              enabled: true,
              type: 'scooter',
              // no operatorId set
              // operatorId: 'any-operator'
            },
          },
        },
      };
      expect(getSharingOperatorsByFormFactor('scooter', config)).to.deep.equal([
        {
          operatorId: 'other',
        },
      ]);
    });
    it('should return the operator if it is specified', () => {
      const config = {
        cityBike: {
          operators: {
            'any-operator': { operatorId: 'any-operator' },
          },
          networks: {
            foobar: {
              icon: 'citybike',
              enabled: true,
              form_factors: ['car'],
              operator: 'any-operator',
            },
          },
        },
      };
      expect(getSharingOperatorsByFormFactor('car', config)).to.deep.equal([
        {
          operatorId: 'any-operator',
        },
      ]);
    });
  });
});

import { expect } from 'chai';
import { describe, it } from 'mocha';

import * as utils from '../../../app/util/otpStrings';

describe('otpStrings', () =>
  describe('otpToLocation', () => {
    it('should parse address and coordinates', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365';
      const location = utils.otpToLocation(input);
      expect(location.address).to.equal('Kluuvi, luoteinen, Kluuvi, Helsinki');
      expect(location.lat).to.equal(60.173123);
      expect(location.lon).to.equal(24.948365);
    });

    it('should ignore an invalid lat', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::foo,24.948365';
      const location = utils.otpToLocation(input);
      expect(location.address).to.equal('Kluuvi, luoteinen, Kluuvi, Helsinki');
      expect(Object.prototype.hasOwnProperty.call(location, 'lat')).to.equal(
        false,
      );
      expect(Object.prototype.hasOwnProperty.call(location, 'lon')).to.equal(
        false,
      );
    });

    it('should ignore an invalid lon', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,foo';
      const location = utils.otpToLocation(input);
      expect(location.address).to.equal('Kluuvi, luoteinen, Kluuvi, Helsinki');
      expect(Object.prototype.hasOwnProperty.call(location, 'lat')).to.equal(
        false,
      );
      expect(Object.prototype.hasOwnProperty.call(location, 'lon')).to.equal(
        false,
      );
    });

    it('should parse a valid slack time', () => {
      const input =
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365::1000';
      const location = utils.otpToLocation(input);
      expect(location.locationSlack).to.equal(1000);
    });

    it('should parse a valid slack time when coordinates are invalid', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::foo,bar::1000';
      const location = utils.otpToLocation(input);
      expect(location.locationSlack).to.equal(1000);
    });

    it('should ignore a missing slack time', () => {
      const input = 'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365';
      const location = utils.otpToLocation(input);
      expect(
        Object.prototype.hasOwnProperty.call(location, 'locationSlack'),
      ).to.equal(false);
    });

    it('should ignore an invalid slack time', () => {
      const input =
        'Kluuvi, luoteinen, Kluuvi, Helsinki::60.173123,24.948365::foo';
      const location = utils.otpToLocation(input);
      expect(
        Object.prototype.hasOwnProperty.call(location, 'locationSlack'),
      ).to.equal(false);
    });
  }));

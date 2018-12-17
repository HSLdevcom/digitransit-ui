import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  ICON_SIZES,
  getIconUrl,
  generateManifestIcons,
  generateManifest,
} from '../../../app/util/manifestUtils';

describe('manifestUtils', () => {
  describe('getIconUrl', () => {
    it('should use config.URL.ASSET_URL and config.iconPath if defined', () => {
      const config = {
        iconPath: 'bar',
        URL: {
          ASSET_URL: 'https://foo',
        },
      };
      const protocol = 'https:';
      const host = 'localhost:8080';
      const result = getIconUrl(config, protocol, host, 32);
      expect(result).to.equal('https://foo/bar/android-chrome-32x32.png');
    });

    it('should use config.URL.ASSET_URL and default iconPath', () => {
      const config = {
        URL: {
          ASSET_URL: 'https://foobar',
        },
      };
      const protocol = 'http:';
      const host = 'localhost:8080';
      const result = getIconUrl(config, protocol, host, 32);
      expect(result).to.equal('https://foobar/icons/android-chrome-32x32.png');
    });

    it('should use the current host as a fallback', () => {
      const config = {
        iconPath: 'baz/',
        URL: {},
      };
      const protocol = 'https:';
      const host = 'foobar';
      const result = getIconUrl(config, protocol, host, 32);
      expect(result).to.equal('https://foobar/baz/android-chrome-32x32.png');
    });

    it('should use the given protocol', () => {
      const config = {
        URL: {},
      };
      const protocol = 'foobar:';
      const host = 'localhost:8080';
      const result = getIconUrl(config, protocol, host, 32);
      expect(result).to.equal(
        'foobar://localhost:8080/icons/android-chrome-32x32.png',
      );
    });
  });

  describe('generateManifestIcons', () => {
    it('should return an array of icons with type "image/png"', () => {
      const config = {
        URL: {},
      };
      const protocol = 'https:';
      const host = 'localhost:8080';
      const result = generateManifestIcons(config, protocol, host);
      expect(result.every(icon => icon.type === 'image/png')).to.equal(true);
    });

    it('should return an array of icons with predefined sizes', () => {
      const config = {
        URL: {},
      };
      const protocol = 'https:';
      const host = 'localhost:8080';
      const result = generateManifestIcons(config, protocol, host);

      ICON_SIZES.map(size => `${size}x${size}`).forEach(size =>
        expect(
          result.some(
            icon => icon.sizes === size && icon.src.indexOf(size) > -1,
          ),
        ),
      );
    });
  });

  describe('generateManifest', () => {
    const emptyConfig = {
      colors: {},
      meta: {},
      URL: {},
    };

    const emptyLocation = {
      host: '',
      pathname: '',
      protocol: '',
    };

    it('should use the configured primary color as background_color and theme_color', () => {
      const config = {
        ...emptyConfig,
        colors: {
          primary: 'foo',
        },
      };
      const manifest = generateManifest(config, emptyLocation);
      expect(manifest.background_color).to.equal('foo');
      expect(manifest.theme_color).to.equal('foo');
    });

    it('should use the given title as name and short_name', () => {
      const manifest = generateManifest(emptyConfig, emptyLocation, {
        title: 'foo',
      });
      expect(manifest.name).to.equal('foo');
      expect(manifest.short_name).to.equal('foo');
    });

    it('should use the configured title as name and short_name', () => {
      const config = {
        ...emptyConfig,
        title: 'foo',
      };
      const manifest = generateManifest(config, emptyLocation);
      expect(manifest.name).to.equal('foo');
      expect(manifest.short_name).to.equal('foo');
    });

    it('should use the given description as description', () => {
      const manifest = generateManifest(emptyConfig, emptyLocation, {
        description: 'foo',
      });
      expect(manifest.description).to.equal('foo');
    });

    it('should use the configured description as description', () => {
      const config = {
        ...emptyConfig,
        meta: {
          description: 'foo',
        },
      };
      const manifest = generateManifest(config, emptyLocation);
      expect(manifest.description).to.equal('foo');
    });

    it('should generate a start_url for the current location', () => {
      const location = {
        host: 'localhost:8080',
        pathname: '/',
        protocol: 'https:',
      };
      const manifest = generateManifest(emptyConfig, location);
      expect(manifest.start_url).to.equal(
        'https://localhost:8080/?homescreen=1',
      );
    });
  });
});

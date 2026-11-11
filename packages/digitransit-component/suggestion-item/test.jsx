import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuggestionItem, {
  getStopBadge,
  STOP_STATUS_BADGE_IMGS,
} from './src/index';

describe('Testing @digitransit-component/digitransit-component-suggestion-item module', () => {
  it('renders a geocoded address suggestion with name and label', () => {
    const item = {
      type: 'Address',
      name: 'Mannerheimintie 1',
      address: 'Mannerheimintie 1, Helsinki',
      properties: { layer: 'address' },
    };
    render(
      <SuggestionItem
        item={item}
        content={['Osoite', 'Mannerheimintie 1', 'Helsinki']}
      />,
    );
    expect(screen.getByText('Mannerheimintie 1')).toBeTruthy();
    expect(screen.getByText('Helsinki')).toBeTruthy();
  });

  it('renders a favourite place using only its name', () => {
    const item = {
      type: 'FavouritePlace',
      name: 'Home',
      address: 'Kotikatu 1, Helsinki',
      selectedIconId: 'icon-icon_home',
      properties: { layer: 'favouritePlace' },
    };
    render(
      <SuggestionItem
        item={item}
        content={['Suosikki', 'Home', 'Kotikatu 1, Helsinki']}
        colors={{ primary: '#0074bf' }}
      />,
    );
    expect(screen.getByText('Home')).toBeTruthy();
  });

  it('renders a stop suggestion with its stop code shown separately from the name', () => {
    const item = {
      type: 'Stop',
      properties: { layer: 'stop', id: '1234' },
    };
    render(
      <SuggestionItem
        item={item}
        content={['Pysäkki', 'Rautatientori', 'Helsinki', '1234']}
      />,
    );
    expect(screen.getByText('Rautatientori')).toBeTruthy();
    expect(screen.getByText('1234')).toBeTruthy();
  });

  it('renders a future route suggestion with both origin and destination names', () => {
    const item = {
      type: 'FutureRoute',
      translatedText: 'Coming Friday',
      properties: {
        layer: 'futureRoute',
        origin: { name: 'Pasila', localadmin: 'Helsinki' },
        destination: { name: 'Myyrmäki', localadmin: 'Vantaa' },
      },
    };
    render(<SuggestionItem item={item} content={['Tuleva reitti']} />);
    expect(screen.getByText('Pasila')).toBeTruthy();
    expect(screen.getByText('Myyrmäki')).toBeTruthy();
    expect(screen.getByText('Coming Friday')).toBeTruthy();
  });

  describe('stop status badge', () => {
    const makeStopItem = gtfs => ({
      type: 'Stop',
      properties: {
        layer: 'stop',
        gtfsId: 'HSL:1234567',
        addendum: { GTFS: gtfs },
      },
    });
    const content = ['Pysäkki', 'Rautatientori', 'Helsinki', '1234'];

    const countSvgs = props => {
      const { container, unmount } = render(
        <SuggestionItem
          item={makeStopItem({ noService: true })}
          content={content}
          {...props}
        />,
      );
      const count = container.querySelectorAll('svg').length;
      unmount();
      return count;
    };

    it('renders an extra badge icon only when showStopStatusMarkers is true and a badge applies', () => {
      expect(countSvgs({ showStopStatusMarkers: true })).toBe(
        countSvgs({ showStopStatusMarkers: false }) + 1,
      );
    });

    describe('getStopBadge', () => {
      it('returns null for layers that are not stops or stations', () => {
        const item = makeStopItem({ noService: true });
        item.properties.layer = 'address';
        expect(getStopBadge(item)).toBeNull();
      });

      it('returns null when item.properties is missing entirely', () => {
        expect(getStopBadge({})).toBeNull();
      });

      ['stop', 'favouriteStop', 'station', 'favouriteStation'].forEach(
        layer => {
          it(`considers the "${layer}" layer eligible for a badge`, () => {
            const item = makeStopItem({ noService: true });
            item.properties.layer = layer;
            expect(getStopBadge(item)).toBe(
              STOP_STATUS_BADGE_IMGS['out-of-service'],
            );
          });
        },
      );

      it('returns null when no gtfsId can be resolved', () => {
        const item = makeStopItem({ noService: true });
        delete item.properties.gtfsId;
        item.properties.gid = 'whosonfirst:venue:1234';
        expect(getStopBadge(item)).toBeNull();
      });

      it('extracts the gtfsId from item.properties.gid', () => {
        const item = makeStopItem({ noService: true });
        delete item.properties.gtfsId;
        item.properties.gid = 'GTFS:HSL:1234567#0';
        expect(getStopBadge(item)).toBe(
          STOP_STATUS_BADGE_IMGS['out-of-service'],
        );
      });

      it('prioritises noService over noServiceToday and alertSeverity', () => {
        const item = makeStopItem({
          noService: true,
          noServiceToday: true,
          alertSeverity: 'alert',
        });
        expect(getStopBadge(item)).toBe(
          STOP_STATUS_BADGE_IMGS['out-of-service'],
        );
      });

      it('prioritises noServiceToday over alertSeverity', () => {
        const item = makeStopItem({
          noServiceToday: true,
          alertSeverity: 'alert',
        });
        expect(getStopBadge(item)).toBe(
          STOP_STATUS_BADGE_IMGS['no-service-today'],
        );
      });

      it('returns the alert badge for an "alert" severity', () => {
        const item = makeStopItem({ alertSeverity: 'alert' });
        expect(getStopBadge(item)).toBe(STOP_STATUS_BADGE_IMGS.alert);
      });

      it('returns the info badge for an "info" severity', () => {
        const item = makeStopItem({ alertSeverity: 'info' });
        expect(getStopBadge(item)).toBe(STOP_STATUS_BADGE_IMGS.info);
      });

      it('returns null for an unrecognized alert severity', () => {
        const item = makeStopItem({ alertSeverity: 'unknown' });
        expect(getStopBadge(item)).toBeNull();
      });
    });
  });
});

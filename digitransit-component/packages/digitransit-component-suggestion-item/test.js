import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import SuggestionItem, {
  getStopBadge,
  STOP_STATUS_BADGE_IMGS,
} from './src/index.js';

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

  const stopItem = {
    properties: {
      layer: 'stop',
      gtfsId: 'HSL:1234567',
      addendum: { GTFS: { noService: true } },
    },
  };
  const content = ['Pysäkki', 'Rautatientori', 'Helsinki', '1234'];

  it('does not render a badge when showStopStatusMarkers is false', () => {
    const { container } = render(
      <SuggestionItem item={stopItem} content={content} />,
    );
    expect(container.querySelector('.suggestion-status-badge')).toBeNull();
  });

  it('renders a badge when showStopStatusMarkers is true and a badge applies', () => {
    const { container } = render(
      <SuggestionItem
        item={stopItem}
        content={content}
        showStopStatusMarkers
      />,
    );
    expect(container.querySelector('.suggestion-status-badge')).toBeTruthy();
    expect(getStopBadge(stopItem)).toBe(
      STOP_STATUS_BADGE_IMGS['out-of-service'],
    );
  });

  describe('getStopBadge', () => {
    it('returns null for layers that are not stops or stations', () => {
      const nonStopItem = {
        properties: {
          layer: 'address',
          gtfsId: 'HSL:1234567',
          addendum: { GTFS: { noService: true } },
        },
      };
      expect(getStopBadge(nonStopItem)).toBe(null);
    });

    it('returns null when item.properties is missing entirely', () => {
      expect(getStopBadge({})).toBe(null);
    });

    ['stop', 'favouriteStop', 'station', 'favouriteStation'].forEach(layer => {
      it(`considers the "${layer}" layer eligible for a badge`, () => {
        const layerItem = {
          properties: {
            layer,
            gtfsId: 'HSL:1234567',
            addendum: { GTFS: { noService: true } },
          },
        };
        expect(getStopBadge(layerItem)).toBe(
          STOP_STATUS_BADGE_IMGS['out-of-service'],
        );
      });
    });

    it('returns null when no gtfsId can be resolved', () => {
      const noIdItem = {
        properties: {
          layer: 'stop',
          gid: 'whosonfirst:venue:1234',
          addendum: { GTFS: { noService: true } },
        },
      };
      expect(getStopBadge(noIdItem)).toBe(null);
    });

    it('extracts the gtfsId from item.properties.gid', () => {
      const gidItem = {
        properties: {
          layer: 'stop',
          gid: 'GTFS:HSL:1234567#0',
          addendum: { GTFS: { noService: true } },
        },
      };
      expect(getStopBadge(gidItem)).toBe(
        STOP_STATUS_BADGE_IMGS['out-of-service'],
      );
    });

    it('prioritises noService over noServiceToday and alertSeverity', () => {
      const priorityItem = {
        properties: {
          layer: 'stop',
          gtfsId: 'HSL:1234567',
          addendum: {
            GTFS: {
              noService: true,
              noServiceToday: true,
              alertSeverity: 'alert',
            },
          },
        },
      };
      expect(getStopBadge(priorityItem)).toBe(
        STOP_STATUS_BADGE_IMGS['out-of-service'],
      );
    });

    it('prioritises noServiceToday over alertSeverity', () => {
      const noServiceTodayItem = {
        properties: {
          layer: 'stop',
          gtfsId: 'HSL:1234567',
          addendum: {
            GTFS: {
              noServiceToday: true,
              alertSeverity: 'alert',
            },
          },
        },
      };
      expect(getStopBadge(noServiceTodayItem)).toBe(
        STOP_STATUS_BADGE_IMGS['no-service-today'],
      );
    });

    it('returns the alert badge for an "alert" severity', () => {
      const alertItem = {
        properties: {
          layer: 'station',
          gtfsId: 'HSL:1234567',
          addendum: { GTFS: { alertSeverity: 'alert' } },
        },
      };
      expect(getStopBadge(alertItem)).toBe(STOP_STATUS_BADGE_IMGS.alert);
    });

    it('returns the info badge for an "info" severity', () => {
      const infoItem = {
        properties: {
          layer: 'station',
          gtfsId: 'HSL:1234567',
          addendum: { GTFS: { alertSeverity: 'info' } },
        },
      };
      expect(getStopBadge(infoItem)).toBe(STOP_STATUS_BADGE_IMGS.info);
    });

    it('returns null for an unrecognized alert severity', () => {
      const unknownSeverityItem = {
        properties: {
          layer: 'station',
          gtfsId: 'HSL:1234567',
          addendum: { GTFS: { alertSeverity: 'unknown' } },
        },
      };
      expect(getStopBadge(unknownSeverityItem)).toBe(null);
    });
  });
});

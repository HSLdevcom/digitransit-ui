/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallow, configure } from 'enzyme';
import Icon from '@digitransit-component/digitransit-component-icon';
import SuggestionItem, { getStopBadge, STOP_STATUS_BADGE_IMGS } from './src';

configure({ adapter: new Adapter() });

describe('Testing @digitransit-component/digitransit-component-suggestion-item module', () => {
  const item = {};
  const content = ['suggestionType', 'label', 'name'];
  const wrapper = shallow(<SuggestionItem item={item} content={content} />);

  it('should render', () => {
    expect(wrapper.isEmptyRender()).to.equal(false);
  });

  const stopItem = {
    properties: {
      layer: 'stop',
      gtfsId: 'HSL:1234567',
      addendum: { GTFS: { noService: true } },
    },
  };

  it('does not render a badge when showStopStatusMarkers is false', () => {
    const noBadgeWrapper = shallow(
      <SuggestionItem item={stopItem} content={content} />,
    );
    expect(noBadgeWrapper.find(Icon)).to.have.lengthOf(1);
  });

  it('renders a badge when showStopStatusMarkers is true and a badge applies', () => {
    const badgeWrapper = shallow(
      <SuggestionItem
        item={stopItem}
        content={content}
        showStopStatusMarkers
      />,
    );
    const badgeIcon = badgeWrapper.find(Icon).at(1);
    expect(badgeIcon.prop('img')).to.equal(
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
      expect(getStopBadge(nonStopItem)).to.equal(null);
    });

    it('returns null when item.properties is missing entirely', () => {
      expect(getStopBadge({})).to.equal(null);
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
        expect(getStopBadge(layerItem)).to.equal(
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
      expect(getStopBadge(noIdItem)).to.equal(null);
    });

    it('extracts the gtfsId from item.properties.gid', () => {
      const gidItem = {
        properties: {
          layer: 'stop',
          gid: 'GTFS:HSL:1234567#0',
          addendum: { GTFS: { noService: true } },
        },
      };
      expect(getStopBadge(gidItem)).to.equal(
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
      expect(getStopBadge(priorityItem)).to.equal(
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
      expect(getStopBadge(noServiceTodayItem)).to.equal(
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
      expect(getStopBadge(alertItem)).to.equal(STOP_STATUS_BADGE_IMGS.alert);
    });

    it('returns the info badge for an "info" severity', () => {
      const infoItem = {
        properties: {
          layer: 'station',
          gtfsId: 'HSL:1234567',
          addendum: { GTFS: { alertSeverity: 'info' } },
        },
      };
      expect(getStopBadge(infoItem)).to.equal(STOP_STATUS_BADGE_IMGS.info);
    });

    it('returns null for an unrecognized alert severity', () => {
      const unknownSeverityItem = {
        properties: {
          layer: 'station',
          gtfsId: 'HSL:1234567',
          addendum: { GTFS: { alertSeverity: 'unknown' } },
        },
      };
      expect(getStopBadge(unknownSeverityItem)).to.equal(null);
    });
  });
});

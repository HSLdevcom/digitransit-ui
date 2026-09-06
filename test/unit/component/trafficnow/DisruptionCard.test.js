import React from 'react';
import { shallow } from 'enzyme';
import { createShallowHookSandbox } from '../../helpers/mock-intl-enzyme';
import DisruptionCard from '../../../../app/component/trafficnow/DisruptionCard';
import DisruptionStatus from '../../../../app/component/trafficnow/components/DisruptionStatus';
import RouteBadges from '../../../../app/component/trafficnow/RouteBadges';
import Card from '../../../../app/component/Card';
import { AlertSeverityLevelType } from '../../../../app/constants';

const baseConfig = {
  CONFIG: 'default',
  colors: { primary: '#007ac9' },
};

// NOW_MS = 1 000 000 ms.  effectiveStartDate = 500 s (past), effectiveEndDate = 2 000 s (future).
const NOW_MS = 1_000_000;

const makeAlert = (overrides = {}) => ({
  id: 'alert-1',
  alertSeverityLevel: AlertSeverityLevelType.Warning,
  alertEffect: 'DELAY',
  alertHeaderText: 'Service disruption',
  alertDescriptionText: 'Trains delayed by 15 minutes.',
  entities: [
    {
      __typename: 'Route',
      gtfsId: 'HSL:1',
      id: 'HSL:1',
      mode: 'BUS',
      shortName: '1',
    },
  ],
  effectiveStartDate: 500, // seconds
  effectiveEndDate: 2000, // seconds
  ...overrides,
});

describe('<DisruptionCard />', () => {
  beforeEach(() => {
    createShallowHookSandbox({ config: baseConfig });
    vi.spyOn(Date, 'now').mockReturnValue(NOW_MS);
  });

  describe('RouteBadges', () => {
    it('renders RouteBadges when entities are present', () => {
      const alert = makeAlert({
        entities: [
          {
            __typename: 'Route',
            gtfsId: 'HSL:1',
            id: 'HSL:1',
            mode: 'BUS',
            shortName: '1',
          },
        ],
      });
      const wrapper = shallow(<DisruptionCard alert={alert} />);
      expect(wrapper.find(RouteBadges)).toHaveLength(1);
    });

    it('still renders RouteBadges when entities is an empty array', () => {
      const alert = makeAlert({ entities: [] });
      const wrapper = shallow(<DisruptionCard alert={alert} />);
      expect(wrapper.find(RouteBadges).prop('entities')).toEqual([]);
    });
  });

  describe('isMobile layout', () => {
    it('renders separator and DisruptionStatus in the header when isMobile=false', () => {
      const wrapper = shallow(
        <DisruptionCard alert={makeAlert()} isMobile={false} />,
      );
      expect(wrapper.find('.separator.vertical')).toHaveLength(1);
      expect(wrapper.find('header').find(DisruptionStatus)).toHaveLength(1);
    });

    it('hides the header separator and moves DisruptionStatus below route badges when isMobile=true', () => {
      const wrapper = shallow(<DisruptionCard alert={makeAlert()} isMobile />);
      expect(wrapper.find('.separator.vertical')).toHaveLength(0);
      expect(wrapper.find('header').find(DisruptionStatus)).toHaveLength(0);
      expect(wrapper.find(DisruptionStatus)).toHaveLength(1);
    });

    it('passes showDates=false to DisruptionStatus for INFO severity', () => {
      const alert = makeAlert({
        alertSeverityLevel: AlertSeverityLevelType.Info,
      });
      const wrapper = shallow(<DisruptionCard alert={alert} />);
      expect(wrapper.find(DisruptionStatus).prop('showDates')).toBe(false);
    });

    it('passes showDates=true to DisruptionStatus for WARNING severity', () => {
      const alert = makeAlert({
        alertSeverityLevel: AlertSeverityLevelType.Warning,
      });
      const wrapper = shallow(<DisruptionCard alert={alert} />);
      expect(wrapper.find(DisruptionStatus).prop('showDates')).toBe(true);
    });
  });

  describe('onClick delegation', () => {
    it('calls onClick with the alert id when the card is clicked', () => {
      const onClickSpy = vi.fn();
      const alert = makeAlert({ id: 'alert-42' });
      const wrapper = shallow(
        <DisruptionCard alert={alert} onClick={onClickSpy} />,
      );
      wrapper.find(Card).prop('onClick')();
      expect(onClickSpy.mock.calls[0][0]).toBe('alert-42');
    });
  });

  describe('Null entities', () => {
    it('does not render RouteBadges when entities is null', () => {
      const alert = makeAlert({ entities: null });
      const wrapper = shallow(<DisruptionCard alert={alert} />);
      expect(wrapper.find(RouteBadges)).toHaveLength(0);
    });
  });
});

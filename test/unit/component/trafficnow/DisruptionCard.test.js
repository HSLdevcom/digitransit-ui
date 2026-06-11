import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
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
  let sandbox;

  beforeEach(() => {
    ({ sandbox } = createShallowHookSandbox({ config: baseConfig }));
    sandbox.stub(Date, 'now').returns(NOW_MS);
  });

  afterEach(() => sandbox.restore());

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
      expect(wrapper.find(RouteBadges)).to.have.lengthOf(1);
    });

    it('still renders RouteBadges when entities is an empty array', () => {
      const alert = makeAlert({ entities: [] });
      const wrapper = shallow(<DisruptionCard alert={alert} />);
      expect(wrapper.find(RouteBadges).prop('entities')).to.deep.equal([]);
    });
  });

  describe('isMobile layout', () => {
    it('renders separator and DisruptionStatus in the header when isMobile=false', () => {
      const wrapper = shallow(
        <DisruptionCard alert={makeAlert()} isMobile={false} />,
      );
      expect(wrapper.find('.separator.vertical')).to.have.lengthOf(1);
      expect(wrapper.find('header').find(DisruptionStatus)).to.have.lengthOf(1);
    });

    it('hides the header separator and moves DisruptionStatus below route badges when isMobile=true', () => {
      const wrapper = shallow(<DisruptionCard alert={makeAlert()} isMobile />);
      expect(wrapper.find('.separator.vertical')).to.have.lengthOf(0);
      expect(wrapper.find('header').find(DisruptionStatus)).to.have.lengthOf(0);
      expect(wrapper.find(DisruptionStatus)).to.have.lengthOf(1);
    });

    it('passes showDates=false to DisruptionStatus for INFO severity', () => {
      const alert = makeAlert({
        alertSeverityLevel: AlertSeverityLevelType.Info,
      });
      const wrapper = shallow(<DisruptionCard alert={alert} />);
      expect(wrapper.find(DisruptionStatus).prop('showDates')).to.equal(false);
    });

    it('passes showDates=true to DisruptionStatus for WARNING severity', () => {
      const alert = makeAlert({
        alertSeverityLevel: AlertSeverityLevelType.Warning,
      });
      const wrapper = shallow(<DisruptionCard alert={alert} />);
      expect(wrapper.find(DisruptionStatus).prop('showDates')).to.equal(true);
    });
  });

  describe('onClick delegation', () => {
    it('calls onClick with the alert id when the card is clicked', () => {
      const onClickSpy = sinon.spy();
      const alert = makeAlert({ id: 'alert-42' });
      const wrapper = shallow(
        <DisruptionCard alert={alert} onClick={onClickSpy} />,
      );
      wrapper.find(Card).prop('onClick')();
      expect(onClickSpy.firstCall.args[0]).to.equal('alert-42');
    });
  });

  describe('Null entities', () => {
    it('does not render RouteBadges when entities is null', () => {
      const alert = makeAlert({ entities: null });
      const wrapper = shallow(<DisruptionCard alert={alert} />);
      expect(wrapper.find(RouteBadges)).to.have.lengthOf(0);
    });
  });
});

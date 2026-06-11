import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import { shallow } from 'enzyme';
import { createShallowHookSandbox } from '../../helpers/mock-intl-enzyme';
import DisruptionStatus from '../../../../app/component/trafficnow/components/DisruptionStatus';
import Icon from '../../../../app/component/Icon';
import * as timeUtils from '../../../../app/util/timeUtils';

const baseConfig = {
  CONFIG: 'default',
  colors: { primary: '#007ac9' },
};

// NOW_MS = 1 000 000 ms (= 1 000 s).
// effectiveStartDate / effectiveEndDate are passed in seconds; the component
// multiplies by 1 000 to convert to milliseconds before comparing with Date.now().
const NOW_MS = 1_000_000;

describe('<DisruptionStatus />', () => {
  let sandbox;

  beforeEach(() => {
    ({ sandbox } = createShallowHookSandbox({ config: baseConfig }));
    sandbox.stub(Date, 'now').returns(NOW_MS);
  });

  afterEach(() => sandbox.restore());

  describe('isValid — timestamp-based', () => {
    it('shows icon_status (active) when now is between start and end', () => {
      const wrapper = shallow(
        <DisruptionStatus effectiveStartDate={500} effectiveEndDate={2000} />,
      );
      expect(wrapper.find(Icon).prop('img')).to.equal('icon_status');
    });

    it('shows icon_calendar (upcoming) when start is in the future', () => {
      const wrapper = shallow(
        <DisruptionStatus effectiveStartDate={2000} effectiveEndDate={5000} />,
      );
      expect(wrapper.find(Icon).prop('img')).to.equal('icon_calendar');
    });

    it('shows icon_calendar (ended) when end is in the past', () => {
      const wrapper = shallow(
        <DisruptionStatus effectiveStartDate={100} effectiveEndDate={500} />,
      );
      expect(wrapper.find(Icon).prop('img')).to.equal('icon_calendar');
    });
  });

  describe('active prop override', () => {
    it('shows icon_status when active=true regardless of timestamps', () => {
      // Timestamps say upcoming but active overrides
      const wrapper = shallow(
        <DisruptionStatus
          active
          effectiveStartDate={2000}
          effectiveEndDate={5000}
        />,
      );
      expect(wrapper.find(Icon).prop('img')).to.equal('icon_status');
    });

    it('shows icon_calendar when active=false regardless of timestamps', () => {
      // Timestamps say valid but active=false overrides
      const wrapper = shallow(
        <DisruptionStatus
          active={false}
          effectiveStartDate={500}
          effectiveEndDate={2000}
        />,
      );
      expect(wrapper.find(Icon).prop('img')).to.equal('icon_calendar');
    });
  });

  describe('showDates', () => {
    it('hides the date span when showDates=false', () => {
      const wrapper = shallow(
        <DisruptionStatus
          effectiveStartDate={500}
          effectiveEndDate={2000}
          showDates={false}
        />,
      );
      expect(wrapper.find('.routes-s')).to.have.lengthOf(0);
    });

    it('renders the date span when showDates=true and effectiveStartDate is non-zero', () => {
      const wrapper = shallow(
        <DisruptionStatus
          effectiveStartDate={500}
          effectiveEndDate={2000}
          showDates
        />,
      );
      expect(wrapper.find('.routes-s')).to.have.lengthOf(1);
    });

    it('hides the date span when showDates=true but effectiveStartDate is falsy (0)', () => {
      const wrapper = shallow(
        <DisruptionStatus
          effectiveStartDate={0}
          effectiveEndDate={2000}
          showDates
        />,
      );
      expect(wrapper.find('.routes-s')).to.have.lengthOf(0);
    });
  });

  describe('Date range text', () => {
    // Stub getFormattedTimeDate to make tests timezone-independent.
    beforeEach(() => {
      sandbox.stub(timeUtils, 'getFormattedTimeDate').callsFake(ms => {
        if (ms === 1_000_000) {
          return 'start-date';
        }
        if (ms === 2_000_000) {
          return 'end-date';
        }
        return `date-${ms}`;
      });
    });

    it('shows "startDate - endDate" when start and end are on different dates', () => {
      const wrapper = shallow(
        <DisruptionStatus
          effectiveStartDate={1000}
          effectiveEndDate={2000}
          showDates
        />,
      );
      expect(wrapper.find('.routes-s').text()).to.include(' - ');
    });

    it('shows only startDate when start and end fall on the same date', () => {
      const wrapper = shallow(
        <DisruptionStatus
          effectiveStartDate={1000}
          effectiveEndDate={1000}
          showDates
        />,
      );
      expect(wrapper.find('.routes-s').text()).to.not.include(' - ');
    });

    it('shows only startDate when effectiveEndDate is not provided', () => {
      const wrapper = shallow(
        <DisruptionStatus effectiveStartDate={1000} showDates />,
      );
      expect(wrapper.find('.routes-s').text()).to.not.include(' - ');
    });
  });
});

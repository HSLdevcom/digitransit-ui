import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import sinon from 'sinon';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import translations from '../../../../app/translations/en';
import { ConfigProvider } from '../../../../app/configurations/ConfigContext';
import DisruptionStatus from '../../../../app/component/trafficnow/components/DisruptionStatus';
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
    sandbox = sinon.createSandbox();
    sandbox.stub(Date, 'now').returns(NOW_MS);
  });

  afterEach(() => sandbox.restore());

  const renderDisruptionStatus = props => {
    const { container } = render(
      <IntlProvider locale="en" messages={translations.en}>
        <ConfigProvider value={baseConfig}>
          <DisruptionStatus {...props} />
        </ConfigProvider>
      </IntlProvider>,
    );
    return container;
  };

  const iconName = container =>
    container.querySelector('use')?.getAttribute('xlink:href')?.slice(1);

  const dateSpan = container => container.querySelector('.routes-s');

  describe('isValid — timestamp-based', () => {
    it('shows icon_status (active) when now is between start and end', () => {
      const container = renderDisruptionStatus({
        effectiveStartDate: 500,
        effectiveEndDate: 2000,
      });
      expect(iconName(container)).to.equal('icon_status');
    });

    it('shows icon_calendar (upcoming) when start is in the future', () => {
      const container = renderDisruptionStatus({
        effectiveStartDate: 2000,
        effectiveEndDate: 5000,
      });
      expect(iconName(container)).to.equal('icon_calendar');
    });

    it('shows icon_calendar (ended) when end is in the past', () => {
      const container = renderDisruptionStatus({
        effectiveStartDate: 100,
        effectiveEndDate: 500,
      });
      expect(iconName(container)).to.equal('icon_calendar');
    });
  });

  describe('active prop override', () => {
    it('shows icon_status when active=true regardless of timestamps', () => {
      // Timestamps say upcoming but active overrides
      const container = renderDisruptionStatus({
        active: true,
        effectiveStartDate: 2000,
        effectiveEndDate: 5000,
      });
      expect(iconName(container)).to.equal('icon_status');
    });

    it('shows icon_calendar when active=false regardless of timestamps', () => {
      // Timestamps say valid but active=false overrides
      const container = renderDisruptionStatus({
        active: false,
        effectiveStartDate: 500,
        effectiveEndDate: 2000,
      });
      expect(iconName(container)).to.equal('icon_calendar');
    });
  });

  describe('showDates', () => {
    it('hides the date span when showDates=false', () => {
      const container = renderDisruptionStatus({
        effectiveStartDate: 500,
        effectiveEndDate: 2000,
        showDates: false,
      });
      expect(dateSpan(container)).to.equal(null);
    });

    it('renders the date span when showDates=true and effectiveStartDate is non-zero', () => {
      const container = renderDisruptionStatus({
        effectiveStartDate: 500,
        effectiveEndDate: 2000,
        showDates: true,
      });
      expect(dateSpan(container)).to.not.equal(null);
    });

    it('hides the date span when showDates=true but effectiveStartDate is falsy (0)', () => {
      const container = renderDisruptionStatus({
        effectiveStartDate: 0,
        effectiveEndDate: 2000,
        showDates: true,
      });
      expect(dateSpan(container)).to.equal(null);
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
      const container = renderDisruptionStatus({
        effectiveStartDate: 1000,
        effectiveEndDate: 2000,
        showDates: true,
      });
      expect(dateSpan(container).textContent).to.include(' - ');
    });

    it('shows only startDate when start and end fall on the same date', () => {
      const container = renderDisruptionStatus({
        effectiveStartDate: 1000,
        effectiveEndDate: 1000,
        showDates: true,
      });
      expect(dateSpan(container).textContent).to.not.include(' - ');
    });

    it('shows only startDate when effectiveEndDate is not provided', () => {
      const container = renderDisruptionStatus({
        effectiveStartDate: 1000,
        showDates: true,
      });
      expect(dateSpan(container).textContent).to.not.include(' - ');
    });
  });
});

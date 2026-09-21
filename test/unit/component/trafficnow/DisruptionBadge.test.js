import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import translations from '../../../../app/translations/en';
import DisruptionBadge from '../../../../app/component/trafficnow/DisruptionBadge';
import { AlertSeverityLevelType } from '../../../../utils/shared/constants';

// DisruptionBadge renders the real app Icon component (not the globally
// stubbed @hsl-fi/icons one), which emits an <svg><use xlink:href="#..." />.
// Assertions query that instead of the enzyme wrapper.find(Icon).prop('img').
const renderBadge = props => {
  const { container } = render(
    <IntlProvider locale="en" messages={translations.en}>
      <DisruptionBadge {...props} />
    </IntlProvider>,
  );
  return container;
};

const getIconHref = container => {
  const use = container.querySelector('svg use');
  return use && use.getAttribute('xlink:href');
};

describe('<DisruptionBadge />', () => {
  describe('Icon rendering', () => {
    it('renders no Icon when showIcon=false', () => {
      const container = renderBadge({
        label: 'delay',
        variant: AlertSeverityLevelType.Warning,
        showIcon: false,
      });
      expect(container.querySelector('svg')).to.equal(null);
    });

    it('renders icon_info-circled for INFO variant when showIcon=true', () => {
      const container = renderBadge({
        label: 'delay',
        variant: AlertSeverityLevelType.Info,
        showIcon: true,
      });
      expect(container.querySelectorAll('svg')).to.have.lengthOf(1);
      expect(getIconHref(container)).to.equal('#icon_info-circled');
    });

    it('renders icon_info-circled for UNKNOWN_SEVERITY variant when showIcon=true', () => {
      const container = renderBadge({
        label: 'delay',
        variant: AlertSeverityLevelType.Unknown,
        showIcon: true,
      });
      expect(container.querySelectorAll('svg')).to.have.lengthOf(1);
      expect(getIconHref(container)).to.equal('#icon_info-circled');
    });

    it('renders icon_caution_white_exclamation for WARNING variant when showIcon=true', () => {
      const container = renderBadge({
        label: 'delay',
        variant: AlertSeverityLevelType.Warning,
        showIcon: true,
      });
      expect(container.querySelectorAll('svg')).to.have.lengthOf(1);
      expect(getIconHref(container)).to.equal(
        '#icon_caution_white_exclamation',
      );
    });

    it('renders icon_caution_white_exclamation for SEVERE variant when showIcon=true', () => {
      const container = renderBadge({
        label: 'delay',
        variant: AlertSeverityLevelType.Severe,
        showIcon: true,
      });
      expect(container.querySelectorAll('svg')).to.have.lengthOf(1);
      expect(getIconHref(container)).to.equal(
        '#icon_caution_white_exclamation',
      );
    });
  });
});

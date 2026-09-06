import React from 'react';
import { shallowWithIntl } from '../../helpers/mock-intl-enzyme';
import DisruptionBadge from '../../../../app/component/trafficnow/DisruptionBadge';
import Icon from '../../../../app/component/Icon';
import { AlertSeverityLevelType } from '../../../../app/constants';

describe('<DisruptionBadge />', () => {
  describe('Icon rendering', () => {
    it('renders no Icon when showIcon=false', () => {
      const wrapper = shallowWithIntl(
        <DisruptionBadge
          label="delay"
          variant={AlertSeverityLevelType.Warning}
          showIcon={false}
        />,
      );
      expect(wrapper.find(Icon)).toHaveLength(0);
    });

    it('renders icon_info-circled for INFO variant when showIcon=true', () => {
      const wrapper = shallowWithIntl(
        <DisruptionBadge
          label="delay"
          variant={AlertSeverityLevelType.Info}
          showIcon
        />,
      );
      const icon = wrapper.find(Icon);
      expect(icon).toHaveLength(1);
      expect(icon.prop('img')).toBe('icon_info-circled');
    });

    it('renders icon_info-circled for UNKNOWN_SEVERITY variant when showIcon=true', () => {
      const wrapper = shallowWithIntl(
        <DisruptionBadge
          label="delay"
          variant={AlertSeverityLevelType.Unknown}
          showIcon
        />,
      );
      const icon = wrapper.find(Icon);
      expect(icon).toHaveLength(1);
      expect(icon.prop('img')).toBe('icon_info-circled');
    });

    it('renders icon_caution_white_exclamation for WARNING variant when showIcon=true', () => {
      const wrapper = shallowWithIntl(
        <DisruptionBadge
          label="delay"
          variant={AlertSeverityLevelType.Warning}
          showIcon
        />,
      );
      const icon = wrapper.find(Icon);
      expect(icon).toHaveLength(1);
      expect(icon.prop('img')).toBe('icon_caution_white_exclamation');
    });

    it('renders icon_caution_white_exclamation for SEVERE variant when showIcon=true', () => {
      const wrapper = shallowWithIntl(
        <DisruptionBadge
          label="delay"
          variant={AlertSeverityLevelType.Severe}
          showIcon
        />,
      );
      const icon = wrapper.find(Icon);
      expect(icon).toHaveLength(1);
      expect(icon.prop('img')).toBe('icon_caution_white_exclamation');
    });
  });
});

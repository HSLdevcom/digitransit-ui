import React from 'react';

import DepartureTime, {
  fromStopTime,
} from '../../../app/component/DepartureTime';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { RealtimeStateType } from '../../../app/constants';

describe('<DepartureTime />', () => {
  describe('fromStopTime', () => {
    it('should generate a canceled DepartureTime with showCancelationIcon set to true', () => {
      const stoptime = {
        realtimeState: RealtimeStateType.Canceled,
      };
      const currentTime = 0;
      const component = fromStopTime(stoptime, currentTime);
      expect(component.props.canceled).to.equal(true);
      expect(component.props.showCancelationIcon).to.equal(true);
    });

    it('should generate a canceled DepartureTime with showCancelationIcon set to false', () => {
      const stoptime = {
        realtimeState: RealtimeStateType.Canceled,
      };
      const currentTime = 0;
      const component = fromStopTime(stoptime, currentTime, false);
      expect(component.props.canceled).to.equal(true);
      expect(component.props.showCancelationIcon).to.equal(false);
    });
  });

  it('should show the cancelation icon', () => {
    const props = {
      canceled: true,
      currentTime: 0,
      departureTime: 180,
      showCancelationIcon: true,
    };
    const wrapper = shallowWithIntl(<DepartureTime {...props} />, {
      context: { config: { minutesToDepartureLimit: 2 } },
    });
    expect(wrapper.find('.caution')).to.have.lengthOf(1);
  });
});

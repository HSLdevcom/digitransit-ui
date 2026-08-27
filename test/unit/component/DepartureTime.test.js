import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { ConfigProvider } from '../../../app/configurations/ConfigContext';
import DepartureTime, {
  fromStopTime,
} from '../../../app/component/routepage/DepartureTime';
import { RealtimeStateType } from '../../../app/constants';

const renderWithProviders = (ui, config) =>
  render(
    <IntlProvider locale="en" messages={{}}>
      <ConfigProvider value={{ CONFIG: 'default', URL: {}, ...config }}>
        {ui}
      </ConfigProvider>
    </IntlProvider>,
  );

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
    const { container } = renderWithProviders(<DepartureTime {...props} />, {
      minutesToDepartureLimit: 2,
    });
    expect(container.querySelector('.caution')).to.not.equal(null);
  });
});

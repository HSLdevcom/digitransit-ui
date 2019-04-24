import Tab from 'material-ui/Tabs/Tab';
import React from 'react';

import {
  Component as MessageBar,
  getServiceAlertId,
} from '../../../app/component/MessageBar';
import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { setReadMessageIds } from '../../../app/store/localStorage';

const defaultProps = {
  getServiceAlertsAsync: async () => [],
  lang: 'fi',
  messages: [],
};

describe('<MessageBar />', () => {
  it('should render empty if there are no messages', () => {
    const props = { ...defaultProps };
    const wrapper = shallowWithIntl(<MessageBar {...props} />, {
      context: mockContext,
    });
    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('should render the service alert tab', async () => {
    const props = {
      ...defaultProps,
      getServiceAlertsAsync: async () => [
        {
          alertDescriptionText: 'bar',
          alertHeaderText: 'foo',
        },
      ],
    };
    const wrapper = shallowWithIntl(<MessageBar {...props} />, {
      context: mockContext,
    });
    await wrapper.instance().componentDidMount();
    expect(wrapper.find(Tab)).to.have.lengthOf(1);
  });

  it('should not show a closed service alert tab again', async () => {
    const alertId = -1792393699;
    const alerts = [
      { alertDescriptionText: 'bar', alertHash: 1, alertHeaderText: 'foo' },
      { alertDescriptionText: 'text', alertHash: 2, alertHeaderText: 'header' },
    ];

    expect(getServiceAlertId(alerts[0])).to.equal(alertId);
    setReadMessageIds([alertId]);

    const props = {
      ...defaultProps,
      getServiceAlertsAsync: async () => alerts,
    };
    const wrapper = shallowWithIntl(<MessageBar {...props} />, {
      context: mockContext,
    });

    await wrapper.instance().componentDidMount();
    expect(wrapper.instance().validMessages()[0].id).to.not.equal(alertId);
    expect(wrapper.find(Tab)).to.have.lengthOf(1);
  });
});

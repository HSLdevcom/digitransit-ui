import React from 'react';

import {
  Component as MessageBar,
  getServiceAlertId,
} from '../../../app/component/MessageBar';
import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { setReadMessageIds } from '../../../app/store/localStorage';
import { AlertSeverityLevelType } from '../../../app/constants';
import Icon from '../../../app/component/Icon';

const defaultProps = {
  getServiceAlertsAsync: async () => [],
  lang: 'fi',
  messages: [],
  currentTime: 1558610379,
  duplicateMessageCounter: 0,
  breakpoint: 'large',
};

const context = {
  ...mockContext,
  config: {
    messageBarAlerts: true,
  },
};

describe('<MessageBar />', () => {
  it('should render empty if there are no messages', () => {
    const props = { ...defaultProps };
    const wrapper = shallowWithIntl(<MessageBar {...props} />, {
      context,
    });
    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('should render the service alert', async () => {
    const props = {
      ...defaultProps,
      getServiceAlertsAsync: async () => [
        {
          alertDescriptionText: 'bar',
          alertHeaderText: 'foo',
          alertSeverityLevel: AlertSeverityLevelType.Severe,
          effectiveStartDate: defaultProps.currentTime - 100,
          effectiveEndDate: defaultProps.currentTime + 100,
          feed: 'Foo',
        },
      ],
    };
    const wrapper = shallowWithIntl(<MessageBar {...props} />, {
      context,
    });
    await wrapper.instance().componentDidMount();
    expect(wrapper.find(Icon)).to.have.lengthOf(2);
  });

  it('should not show a closed service alert again', async () => {
    const alertId = -1298241169;
    const alerts = [
      {
        alertDescriptionText: 'bar',
        alertHash: 1,
        alertHeaderText: 'foo',
        alertSeverityLevel: AlertSeverityLevelType.Severe,
        effectiveStartDate: defaultProps.currentTime - 100,
        effectiveEndDate: defaultProps.currentTime + 100,
        feed: 'Foo',
      },
      {
        alertDescriptionText: 'text',
        alertHash: 2,
        alertHeaderText: 'header',
        alertSeverityLevel: AlertSeverityLevelType.Severe,
        effectiveStartDate: defaultProps.currentTime - 100,
        effectiveEndDate: defaultProps.currentTime + 100,
        feed: 'Foo',
      },
    ];

    expect(getServiceAlertId(alerts[0])).to.equal(alertId);
    setReadMessageIds([alertId]);

    const props = {
      ...defaultProps,
      getServiceAlertsAsync: async () => alerts,
    };
    const wrapper = shallowWithIntl(<MessageBar {...props} />, {
      context,
    });
    await wrapper.instance().componentDidMount();
    expect(wrapper.instance().validMessages()[0].id).to.not.equal(alertId);
    expect(wrapper.find(Icon)).to.have.lengthOf(2);
  });

  it('should not render service alerts that are expired', async () => {
    const alerts = [
      {
        alertDescriptionText: 'bar',
        alertHeaderText: 'foo',
        alertSeverityLevel: AlertSeverityLevelType.Severe,
        effectiveEndDate: 1558610381,
        effectiveStartDate: 1558610380,
        feed: 'Foo',
      },
    ];
    const props = {
      ...defaultProps,
      getServiceAlertsAsync: async () => alerts,
    };
    const wrapper = shallowWithIntl(<MessageBar {...props} />, {
      context,
    });

    await wrapper.instance().componentDidMount();
    expect(wrapper.find(Icon)).to.have.lengthOf(0);
  });

  it('should not render service alerts when messageBarAlerts is false', async () => {
    const props = {
      ...defaultProps,
      getServiceAlertsAsync: async () => [
        {
          alertDescriptionText: 'bar',
          alertHeaderText: 'foo',
          alertSeverityLevel: AlertSeverityLevelType.Severe,
          effectiveStartDate: defaultProps.currentTime - 100,
          effectiveEndDate: defaultProps.currentTime + 100,
          feed: 'Foo',
        },
      ],
    };
    const wrapper = shallowWithIntl(<MessageBar {...props} />, {
      context: {
        ...context,
        config: {
          messageBarAlerts: false,
        },
      },
    });
    await wrapper.instance().componentDidMount();

    expect(wrapper.find(Icon)).to.have.lengthOf(0);
  });

  it('should have correct background color', async () => {
    const props = {
      ...defaultProps,
      messages: [
        {
          id: '23072019_135154_87',
          backgroundColor: '#000000',
          content: {
            fi: [
              {
                type: 'text',
                content: 'Test message',
              },
            ],
          },
        },
      ],
    };
    const wrapper = shallowWithIntl(<MessageBar {...props} />, {
      context,
    });
    await wrapper.instance().componentDidMount();
    expect(wrapper.find('section').get(0).props.style).to.have.property(
      'background',
      '#000000',
    );
  });
});

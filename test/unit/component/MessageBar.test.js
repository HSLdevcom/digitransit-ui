import React from 'react';
import { Tabs, Tab } from 'material-ui';
import SwipeableViews from 'react-swipeable-views';

import {
  Component as MessageBar,
  getServiceAlertId,
} from '../../../app/component/MessageBar';
import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { setReadMessageIds } from '../../../app/store/localStorage';
import { AlertSeverityLevelType } from '../../../app/constants';

const defaultProps = {
  getServiceAlertsAsync: async () => [],
  lang: 'fi',
  messages: [],
  currentTime: 1558610379,
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
          alertSeverityLevel: AlertSeverityLevelType.Severe,
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
    const alertId = 926603079;
    const alerts = [
      {
        alertDescriptionText: 'bar',
        alertHash: 1,
        alertHeaderText: 'foo',
        alertSeverityLevel: AlertSeverityLevelType.Severe,
      },
      {
        alertDescriptionText: 'text',
        alertHash: 2,
        alertHeaderText: 'header',
        alertSeverityLevel: AlertSeverityLevelType.Severe,
      },
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

  it('should not render service alerts that are expired', async () => {
    const alerts = [
      {
        alertDescriptionText: 'bar',
        alertHeaderText: 'foo',
        alertSeverityLevel: AlertSeverityLevelType.Severe,
        effectiveEndDate: 1558610381,
        effectiveStartDate: 1558610380,
      },
    ];
    const props = {
      ...defaultProps,
      getServiceAlertsAsync: async () => alerts,
    };
    const wrapper = shallowWithIntl(<MessageBar {...props} />, {
      context: mockContext,
    });

    await wrapper.instance().componentDidMount();
    expect(wrapper.find(Tab)).to.have.lengthOf(0);
  });

  it('should render one message when there are two messages but one of them has shouldTrigger: false ', async () => {
    const props = {
      ...defaultProps,
      messages: [
        {
          id: '23072019_135154_87',
          shouldTrigger: true,
          content: {
            fi: [
              {
                type: 'text',
                content: 'Test message',
              },
            ],
          },
        },
        {
          id: '23072019_135154_88',
          shouldTrigger: false,
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
      context: mockContext,
    });

    await wrapper.instance().componentDidMount();
    expect(wrapper.find(Tab)).to.have.lengthOf(1);
  });

  it('should have correct background color', async () => {
    const props = {
      ...defaultProps,
      messages: [
        {
          id: '23072019_135154_87',
          shouldTrigger: true,
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
      context: mockContext,
    });
    await wrapper.instance().componentDidMount();
    expect(wrapper.find('section').get(0).props.style).to.have.property(
      'background',
      '#000000',
    );
    expect(wrapper.find(SwipeableViews).props().slideStyle).to.have.property(
      'background',
      '#000000',
    );
    expect(wrapper.find(Tabs).props().tabItemContainerStyle).to.have.property(
      'backgroundColor',
      '#000000',
    );
  });
});

import React from 'react';
import { waitFor } from '@testing-library/react';

import {
  Component as MessageBar,
  getServiceAlertId,
} from '../../../app/component/MessageBar';
import { mockContext } from '../helpers/mock-context';
import { renderWithProviders } from '../helpers/mock-providers';
import { setReadMessageIds } from '../../../app/store/localStorage';
import { AlertSeverityLevelType } from '../../../app/constants';

const defaultProps = {
  getServiceAlertsAsync: async () => [],
  lang: 'fi',
  messages: [],
  currentTime: 1558610379,
  duplicateMessageCounter: 0,
  breakpoint: 'large',
  relayEnvironment: { environment: {} },
};

const config = {
  ...mockContext.config,
  messageBarAlerts: true,
};

describe('<MessageBar />', () => {
  it('should render empty if there are no messages', async () => {
    const props = { ...defaultProps };
    const { container } = renderWithProviders(<MessageBar {...props} />, {
      config,
      currentTime: defaultProps.currentTime,
    });
    await waitFor(() =>
      expect(container.querySelector('.message-bar')).to.equal(null),
    );
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
    const { container } = renderWithProviders(<MessageBar {...props} />, {
      config,
      currentTime: defaultProps.currentTime,
    });
    await waitFor(() =>
      expect(container.querySelector('.message-bar')).to.not.equal(null),
    );
    expect(container.textContent).to.contain('foo');
    expect(container.textContent).to.contain('bar');
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
    const { container } = renderWithProviders(<MessageBar {...props} />, {
      config,
      currentTime: defaultProps.currentTime,
    });
    await waitFor(() =>
      expect(container.querySelector('.message-bar')).to.not.equal(null),
    );
    expect(container.textContent).to.contain('header');
    expect(container.textContent).to.contain('text');
    expect(container.textContent).to.not.contain('bar');
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
    const { container } = renderWithProviders(<MessageBar {...props} />, {
      config,
      currentTime: defaultProps.currentTime,
    });
    await waitFor(() =>
      expect(container.querySelector('.message-bar')).to.equal(null),
    );
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
    const { container } = renderWithProviders(<MessageBar {...props} />, {
      config: { ...config, messageBarAlerts: false },
      currentTime: defaultProps.currentTime,
    });
    await waitFor(() =>
      expect(container.querySelector('.message-bar')).to.equal(null),
    );
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
    const { container } = renderWithProviders(<MessageBar {...props} />, {
      config,
      currentTime: defaultProps.currentTime,
    });
    await waitFor(() =>
      expect(container.querySelector('.message-bar')).to.not.equal(null),
    );
    expect(container.querySelector('.message-bar').style.background).to.equal(
      'rgb(0, 0, 0)',
    );
  });
});

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { waitFor, act } from '@testing-library/react';

import MessageBar, {
  getServiceAlertId,
} from '../../../app/component/MessageBar';
import { mockContext } from '../helpers/mock-context';
import { renderWithProviders } from '../helpers/mock-providers';
import { setReadMessageIds } from '../../../utils/client/localStorage';
import { AlertSeverityLevelType } from '../../../utils/shared/constants';
import { TimeContext, useCurrentTime } from '../../../app/hooks/TimeContext';
import {
  MessageProvider,
  useMessageActions,
} from '../../../app/hooks/MessageContext';

const CURRENT_TIME = 1558610379;

const defaultProps = {
  getServiceAlertsAsync: async () => [],
  breakpoint: 'large',
};

const EMPTY_MESSAGES = [];

const createDeferredAlertFetch = () => {
  let resolveAlerts;
  const promise = new Promise(resolve => {
    resolveAlerts = resolve;
  });
  return {
    getServiceAlertsAsync: vi.fn(() => promise),
    resolve: alerts => resolveAlerts(alerts),
  };
};

const TimeUpdater = ({ children, onTimeSetter }) => {
  const initialTime = useCurrentTime();
  const [currentTime, setCurrentTime] = useState(initialTime);
  useEffect(() => {
    onTimeSetter(setCurrentTime);
  }, [onTimeSetter]);
  return (
    <TimeContext.Provider value={currentTime}>{children}</TimeContext.Provider>
  );
};

TimeUpdater.propTypes = {
  children: PropTypes.node.isRequired,
  onTimeSetter: PropTypes.func.isRequired,
};

const messageContentItemPropType = PropTypes.shape({
  type: PropTypes.string,
  content: PropTypes.string,
});

const MessageFixtures = ({ children, messages }) => {
  const { addMessage } = useMessageActions();
  useEffect(() => {
    messages.forEach(addMessage);
  }, [addMessage, messages]);
  return children;
};

MessageFixtures.propTypes = {
  children: PropTypes.node.isRequired,
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      backgroundColor: PropTypes.string,
      content: PropTypes.shape({
        fi: PropTypes.arrayOf(messageContentItemPropType),
      }),
    }),
  ).isRequired,
};

const renderMessageBar = (
  props = {},
  options = {},
  wrap = children => children,
) => {
  const { messages = EMPTY_MESSAGES, ...messageBarProps } = props;
  const ui = (
    <MessageProvider>
      <MessageFixtures messages={messages}>
        <MessageBar {...messageBarProps} />
      </MessageFixtures>
    </MessageProvider>
  );
  return renderWithProviders(wrap(ui), options);
};

const config = {
  ...mockContext.config,
  messageBarAlerts: true,
};

describe('<MessageBar />', () => {
  it('should render empty if there are no messages', async () => {
    const fetch = createDeferredAlertFetch();
    const props = {
      ...defaultProps,
      getServiceAlertsAsync: fetch.getServiceAlertsAsync,
    };
    const { container } = renderMessageBar(props, {
      config,
      currentTime: CURRENT_TIME,
    });
    await waitFor(() =>
      expect(fetch.getServiceAlertsAsync).toHaveBeenCalledTimes(1),
    );
    await act(async () => {
      fetch.resolve([]);
    });
    expect(container.querySelector('.message-bar')).toBeNull();
  });

  it('should render the service alert', async () => {
    const props = {
      ...defaultProps,
      getServiceAlertsAsync: async () => [
        {
          alertDescriptionText: 'bar',
          alertHeaderText: 'foo',
          alertSeverityLevel: AlertSeverityLevelType.Severe,
          effectiveStartDate: CURRENT_TIME - 100,
          effectiveEndDate: CURRENT_TIME + 100,
          feed: 'Foo',
        },
      ],
    };
    const { container } = renderMessageBar(props, {
      config,
      currentTime: CURRENT_TIME,
    });
    await waitFor(() =>
      expect(container.querySelector('.message-bar')).not.toBeNull(),
    );
    expect(container.textContent).toContain('foo');
    expect(container.textContent).toContain('bar');
  });

  it('should not show a closed service alert again', async () => {
    const alertId = -1298241169;
    const alerts = [
      {
        alertDescriptionText: 'bar',
        alertHash: 1,
        alertHeaderText: 'foo',
        alertSeverityLevel: AlertSeverityLevelType.Severe,
        effectiveStartDate: CURRENT_TIME - 100,
        effectiveEndDate: CURRENT_TIME + 100,
        feed: 'Foo',
      },
      {
        alertDescriptionText: 'text',
        alertHash: 2,
        alertHeaderText: 'header',
        alertSeverityLevel: AlertSeverityLevelType.Severe,
        effectiveStartDate: CURRENT_TIME - 100,
        effectiveEndDate: CURRENT_TIME + 100,
        feed: 'Foo',
      },
    ];

    expect(getServiceAlertId(alerts[0])).toBe(alertId);
    setReadMessageIds([alertId]);

    const props = {
      ...defaultProps,
      getServiceAlertsAsync: async () => alerts,
    };
    const { container } = renderMessageBar(props, {
      config,
      currentTime: CURRENT_TIME,
    });
    await waitFor(() =>
      expect(container.querySelector('.message-bar')).not.toBeNull(),
    );
    expect(container.textContent).toContain('header');
    expect(container.textContent).toContain('text');
    expect(container.textContent).not.toContain('bar');
  });

  it('should render service alerts at inclusive start and end boundaries', async () => {
    const props = {
      ...defaultProps,
      getServiceAlertsAsync: async () => [
        {
          alertDescriptionText: 'boundary description',
          alertHeaderText: 'boundary alert',
          alertSeverityLevel: AlertSeverityLevelType.Severe,
          effectiveEndDate: CURRENT_TIME,
          effectiveStartDate: CURRENT_TIME,
          feed: 'Foo',
        },
      ],
    };
    const { container } = renderMessageBar(props, {
      config,
      currentTime: CURRENT_TIME,
    });
    await waitFor(() =>
      expect(container.querySelector('.message-bar')).not.toBeNull(),
    );
    expect(container.textContent).toContain('boundary alert');
  });

  it('should not render future service alerts', async () => {
    const alerts = [
      {
        alertDescriptionText: 'bar',
        alertHeaderText: 'future alert',
        alertSeverityLevel: AlertSeverityLevelType.Severe,
        effectiveEndDate: CURRENT_TIME + 200,
        effectiveStartDate: CURRENT_TIME + 100,
        feed: 'Foo',
      },
    ];
    const fetch = createDeferredAlertFetch();
    const props = {
      ...defaultProps,
      getServiceAlertsAsync: fetch.getServiceAlertsAsync,
    };
    const { container } = renderMessageBar(props, {
      config,
      currentTime: CURRENT_TIME,
    });
    await waitFor(() =>
      expect(fetch.getServiceAlertsAsync).toHaveBeenCalledTimes(1),
    );
    await act(async () => {
      fetch.resolve(alerts);
    });
    expect(container.querySelector('.message-bar')).toBeNull();
  });

  it('should not render expired service alerts', async () => {
    const alerts = [
      {
        alertDescriptionText: 'bar',
        alertHeaderText: 'expired alert',
        alertSeverityLevel: AlertSeverityLevelType.Severe,
        effectiveEndDate: CURRENT_TIME - 1,
        effectiveStartDate: CURRENT_TIME - 100,
        feed: 'Foo',
      },
    ];
    const fetch = createDeferredAlertFetch();
    const props = {
      ...defaultProps,
      getServiceAlertsAsync: fetch.getServiceAlertsAsync,
    };
    const { container } = renderMessageBar(props, {
      config,
      currentTime: CURRENT_TIME,
    });
    await waitFor(() =>
      expect(fetch.getServiceAlertsAsync).toHaveBeenCalledTimes(1),
    );
    await act(async () => {
      fetch.resolve(alerts);
    });
    expect(container.querySelector('.message-bar')).toBeNull();
  });

  it('does not refetch or re-filter alerts after context time updates', async () => {
    const alerts = [
      {
        alertDescriptionText: 'first description',
        alertHash: 1,
        alertHeaderText: 'first alert',
        alertSeverityLevel: AlertSeverityLevelType.Severe,
        effectiveEndDate: CURRENT_TIME + 100,
        effectiveStartDate: CURRENT_TIME - 100,
        feed: 'Foo',
      },
      {
        alertDescriptionText: 'second description',
        alertHash: 2,
        alertHeaderText: 'second alert',
        alertSeverityLevel: AlertSeverityLevelType.Severe,
        effectiveEndDate: CURRENT_TIME + 1,
        effectiveStartDate: CURRENT_TIME - 100,
        feed: 'Foo',
      },
    ];
    const getServiceAlertsAsync = vi.fn(async () => alerts);
    let updateCurrentTime;
    const onTimeSetter = setter => {
      updateCurrentTime = setter;
    };
    const props = { ...defaultProps, getServiceAlertsAsync };
    const { container } = renderMessageBar(
      props,
      { config, currentTime: CURRENT_TIME },
      ui => <TimeUpdater onTimeSetter={onTimeSetter}>{ui}</TimeUpdater>,
    );
    await waitFor(() =>
      expect(container.querySelector('.message-bar')).not.toBeNull(),
    );

    act(() => {
      container
        .querySelector('#close-message-bar')
        .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    });
    await waitFor(() => {
      expect(container.textContent).toContain('second alert');
      expect(container.textContent).not.toContain('first alert');
    });

    act(() => updateCurrentTime(CURRENT_TIME + 2));
    expect(container.querySelector('.message-bar')).not.toBeNull();
    expect(container.textContent).toContain('second alert');
    expect(container.textContent).not.toContain('first alert');
    expect(getServiceAlertsAsync).toHaveBeenCalledTimes(1);
  });

  it('should hide the only shown message immediately after clicking close, without a remount', async () => {
    const alerts = [
      {
        alertDescriptionText: 'bar',
        alertHash: 1,
        alertHeaderText: 'foo',
        alertSeverityLevel: AlertSeverityLevelType.Severe,
        effectiveStartDate: CURRENT_TIME - 100,
        effectiveEndDate: CURRENT_TIME + 100,
        feed: 'Foo',
      },
    ];
    const props = {
      ...defaultProps,
      getServiceAlertsAsync: async () => alerts,
    };
    const { container } = renderMessageBar(props, {
      config,
      currentTime: CURRENT_TIME,
    });
    await waitFor(() =>
      expect(container.querySelector('.message-bar')).not.toBeNull(),
    );

    const closeButton = container.querySelector('#close-message-bar');
    act(() => {
      closeButton.dispatchEvent(
        new window.MouseEvent('click', { bubbles: true }),
      );
    });

    await waitFor(() =>
      expect(container.querySelector('.message-bar')).toBeNull(),
    );
  });

  it('should not render service alerts when messageBarAlerts is false', async () => {
    const getServiceAlertsAsync = vi.fn(async () => [
      {
        alertDescriptionText: 'bar',
        alertHeaderText: 'service alert',
        alertSeverityLevel: AlertSeverityLevelType.Severe,
        effectiveStartDate: CURRENT_TIME - 100,
        effectiveEndDate: CURRENT_TIME + 100,
        feed: 'Foo',
      },
    ]);
    const props = {
      ...defaultProps,
      getServiceAlertsAsync,
      messages: [
        {
          id: 'ordinary-message',
          content: {
            fi: [{ type: 'text', content: 'ordinary message' }],
          },
        },
      ],
    };
    const { container } = renderMessageBar(props, {
      config: { ...config, messageBarAlerts: false },
      currentTime: CURRENT_TIME,
    });
    await waitFor(() =>
      expect(container.querySelector('.message-bar')).not.toBeNull(),
    );
    expect(container.textContent).toContain('ordinary message');
    expect(container.textContent).not.toContain('service alert');
    expect(getServiceAlertsAsync).not.toHaveBeenCalled();
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
    const { container } = renderMessageBar(props, {
      config,
      currentTime: CURRENT_TIME,
    });
    await waitFor(() =>
      expect(container.querySelector('.message-bar')).not.toBeNull(),
    );
    expect(container.querySelector('.message-bar').style.background).toBe(
      'rgb(0, 0, 0)',
    );
  });
});

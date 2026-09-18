import { expect } from 'chai';
import fetchMock from 'fetch-mock';
import { describe, it, afterEach } from 'mocha';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import sinon from 'sinon';
import { ConfigProvider } from '../../../app/client/ConfigContext';
import {
  MessageProvider,
  processStaticMessages,
  useMessages,
  useDuplicateMessageCounter,
  useMessageActions,
  messageActions,
} from '../../../app/hooks/MessageContext';
import { setReadMessageIds } from '../../../utils/client/localStorage';
import { mockContext } from '../helpers/mock-context';

/**
 * A test consumer component that exposes the MessageContext's state and
 * actions via a ref so tests can drive/inspect it without reaching into
 * implementation internals.
 */
const MessageConsumer = ({ controlRef }) => {
  const messages = useMessages();
  const duplicateMessageCounter = useDuplicateMessageCounter();
  const actions = useMessageActions();

  useEffect(() => {
    if (controlRef) {
      const ref = controlRef;
      ref.current = { messages, duplicateMessageCounter, actions };
    }
  });

  return <div data-message-count={messages.length} />;
};

MessageConsumer.propTypes = {
  controlRef: PropTypes.shape({ current: PropTypes.object }),
};

const flushEffects = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe('MessageContext', () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
    fetchMock.removeRoutes();
    fetchMock.clearHistory();
  });

  describe('MessageProvider', () => {
    before(() => fetchMock.mockGlobal());
    after(() => fetchMock.unmockGlobal());

    it('loads static and remotely fetched config messages, sorted by priority', async () => {
      const staticMessagesUrl = '/staticMessages';
      fetchMock.get(staticMessagesUrl, {
        staticMessages: [
          {
            id: '2',
            content: {
              en: [{ type: 'text', content: 'foo' }],
            },
          },
        ],
      });
      const config = {
        ...mockContext.config,
        staticMessages: [
          {
            id: '1',
            content: {
              en: [{ type: 'text', content: 'bar' }],
            },
            priority: -1,
          },
        ],
        staticMessagesUrl,
      };
      const controlRef = React.createRef();

      await act(async () => {
        wrapper = render(
          <ConfigProvider value={config}>
            <MessageProvider>
              <MessageConsumer controlRef={controlRef} />
            </MessageProvider>
          </ConfigProvider>,
        );
      });
      await flushEffects();

      expect(fetchMock.callHistory.called(staticMessagesUrl)).to.equal(true);
      expect(controlRef.current.messages).to.deep.equal([
        {
          content: { en: [{ type: 'text', content: 'foo' }] },
          id: '2',
        },
        {
          content: { en: [{ type: 'text', content: 'bar' }] },
          id: '1',
          priority: -1,
        },
      ]);
    });

    it('does not fetch when staticMessagesUrl is an empty string', async () => {
      const config = {
        ...mockContext.config,
        staticMessages: [],
        staticMessagesUrl: '',
      };
      const controlRef = React.createRef();

      await act(async () => {
        wrapper = render(
          <ConfigProvider value={config}>
            <MessageProvider>
              <MessageConsumer controlRef={controlRef} />
            </MessageProvider>
          </ConfigProvider>,
        );
      });
      await flushEffects();

      expect(fetchMock.callHistory.called()).to.equal(false);
    });
  });

  describe('addMessage', () => {
    it('adds a message and increments duplicateMessageCounter on repeat', async () => {
      const controlRef = React.createRef();
      wrapper = render(
        <ConfigProvider value={mockContext.config}>
          <MessageProvider>
            <MessageConsumer controlRef={controlRef} />
          </MessageProvider>
        </ConfigProvider>,
      );

      const message = {
        id: '1',
        content: { en: [{ type: 'text', content: 'bar' }] },
        priority: -1,
      };

      act(() => {
        controlRef.current.actions.addMessage(message);
      });
      expect(controlRef.current.messages.length).to.equal(1);
      expect(controlRef.current.duplicateMessageCounter).to.equal(0);

      act(() => {
        controlRef.current.actions.addMessage(message);
      });
      expect(controlRef.current.messages.length).to.equal(1);
      expect(controlRef.current.duplicateMessageCounter).to.equal(1);
    });
  });

  describe('markMessageAsRead', () => {
    it('removes the message and persists the read id', async () => {
      setReadMessageIds([]);
      const controlRef = React.createRef();
      wrapper = render(
        <ConfigProvider value={mockContext.config}>
          <MessageProvider>
            <MessageConsumer controlRef={controlRef} />
          </MessageProvider>
        </ConfigProvider>,
      );

      const message = {
        id: '42',
        content: { en: [{ type: 'text', content: 'bar' }] },
      };

      act(() => {
        controlRef.current.actions.addMessage(message);
      });
      expect(controlRef.current.messages.length).to.equal(1);

      act(() => {
        controlRef.current.actions.markMessageAsRead('42');
      });
      expect(controlRef.current.messages.length).to.equal(0);
    });

    it('still produces a new messages reference for an id that was never added', () => {
      // Some message-bar items (live service alerts fetched directly by
      // MessageBar, geolocation messages added via the messageActions
      // bridge below) call markMessageAsRead without ever having been added
      // via addMessage/ADD_MESSAGE. Components that only subscribe via
      // useMessages() to detect "something in the message bar changed"
      // (e.g. NaviContainer) rely on the messages reference changing even
      // in this case.
      setReadMessageIds([]);
      const controlRef = React.createRef();
      wrapper = render(
        <ConfigProvider value={mockContext.config}>
          <MessageProvider>
            <MessageConsumer controlRef={controlRef} />
          </MessageProvider>
        </ConfigProvider>,
      );

      const messagesBefore = controlRef.current.messages;
      act(() => {
        controlRef.current.actions.markMessageAsRead('never-added-id');
      });
      expect(controlRef.current.messages).to.not.equal(messagesBefore);
    });
  });

  describe('messageActions bridge', () => {
    it('allows plain (non-React) modules to add and dismiss messages', () => {
      // Mirrors how app/action/PositionActions.js posts geolocation
      // permission/timeout messages: it can't call hooks, so it goes
      // through the messageActions bridge instead of useMessageActions().
      setReadMessageIds([]);
      const controlRef = React.createRef();
      wrapper = render(
        <ConfigProvider value={mockContext.config}>
          <MessageProvider>
            <MessageConsumer controlRef={controlRef} />
          </MessageProvider>
        </ConfigProvider>,
      );

      const message = {
        id: 'geolocation-denied',
        content: { en: [{ type: 'text', content: 'Geolocation denied' }] },
      };

      act(() => {
        messageActions.addMessage(message);
      });
      expect(controlRef.current.messages.map(m => m.id)).to.include(
        'geolocation-denied',
      );

      act(() => {
        messageActions.markMessageAsRead('geolocation-denied');
      });
      expect(controlRef.current.messages.map(m => m.id)).to.not.include(
        'geolocation-denied',
      );
    });
  });

  describe('processStaticMessages', () => {
    it('should process a message with content', () => {
      const staticMessages = [
        {
          id: '03022019_203257_08',
          content: {
            fi: [
              {
                type: 'text',
                content:
                  'Maanantaina 4.2. Leppävaaran A-junat ja Keravan K -junat liikennöivät 20 minuutin välein klo 14 saakka ',
              },
            ],
            en: [
              {
                type: 'text',
                content:
                  'On Monday 4 February, A and K trains run every 20 minutes until 2pm',
              },
            ],
            sv: [
              {
                type: 'text',
                content:
                  'A- och K-tågen går med 20 minuters mellanrum tills kl 14 ',
              },
            ],
          },
        },
      ];
      const callback = sinon.spy();
      processStaticMessages({ staticMessages }, callback);
      expect(callback.called).to.equal(true);
    });

    it('should ignore messages that have no content in any language', () => {
      const staticMessages = [
        {
          id: '03022019_203559_96',
          content: { fi: [], en: [], sv: [] },
        },
        {
          id: '03022019_203612_18',
          content: { fi: [], en: [], sv: [] },
        },
        {
          id: '03022019_203612_86',
          content: { fi: [], en: [], sv: [] },
        },
        {
          id: '04022019_060821_65',
          content: { fi: [], en: [], sv: [] },
        },
      ];
      const callback = sinon.spy();
      processStaticMessages({ staticMessages }, callback);
      expect(callback.called).to.equal(false);
    });

    it('should process messages that have content in some language', () => {
      const staticMessages = [
        {
          id: '03022019_203559_96',
          content: {
            fi: [],
            en: [{ type: 'text', content: 'Foo' }],
            sv: [],
          },
        },
      ];
      const callback = sinon.spy();
      processStaticMessages({ staticMessages }, callback);
      expect(callback.called).to.equal(true);
    });
  });
});

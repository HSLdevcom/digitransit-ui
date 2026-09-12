import { expect } from 'chai';
import fetchMock from 'fetch-mock';
import { describe, it, afterEach } from 'mocha';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import sinon from 'sinon';
import { ConfigProvider } from '../../../app/configurations/ConfigContext';
import {
  MessageProvider,
  processStaticMessages,
  useMessages,
  useDuplicateMessageCounter,
  useMessageActions,
} from '../../../app/hooks/MessageContext';
import { setReadMessageIds } from '../../../app/data/localStorage';
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
        wrapper = mount(
          <ConfigProvider value={config}>
            <MessageProvider>
              <MessageConsumer controlRef={controlRef} />
            </MessageProvider>
          </ConfigProvider>,
        );
      });
      await flushEffects();
      wrapper.update();

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
  });

  describe('addMessage', () => {
    it('adds a message and increments duplicateMessageCounter on repeat', async () => {
      const controlRef = React.createRef();
      wrapper = mount(
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
      wrapper.update();
      expect(controlRef.current.messages.length).to.equal(1);
      expect(controlRef.current.duplicateMessageCounter).to.equal(0);

      act(() => {
        controlRef.current.actions.addMessage(message);
      });
      wrapper.update();
      expect(controlRef.current.messages.length).to.equal(1);
      expect(controlRef.current.duplicateMessageCounter).to.equal(1);
    });
  });

  describe('markMessageAsRead', () => {
    it('removes the message and persists the read id', async () => {
      setReadMessageIds([]);
      const controlRef = React.createRef();
      wrapper = mount(
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
      wrapper.update();
      expect(controlRef.current.messages.length).to.equal(1);

      act(() => {
        controlRef.current.actions.markMessageAsRead('42');
      });
      wrapper.update();
      expect(controlRef.current.messages.length).to.equal(0);
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

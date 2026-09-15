import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import PropTypes from 'prop-types';
import {
  setReadMessageIds,
  getReadMessageIds,
} from '../../utils/client/localStorage';
import { useConfigContext } from '../client/ConfigContext';

export const processStaticMessages = (root, callback) => {
  const { staticMessages } = root;
  if (Array.isArray(staticMessages)) {
    staticMessages
      .filter(
        msg =>
          msg.content &&
          Object.keys(msg.content).some(
            key =>
              Array.isArray(msg.content[key]) && msg.content[key].length > 0,
          ),
      )
      .forEach(callback);
  }
};

const sortMessages = messages => {
  const arr = Array.from(messages.values());
  arr.sort((el1, el2) => {
    const p1 = el1.priority || 0;
    const p2 = el2.priority || 0;
    if (p1 > p2) {
      return -1;
    }
    if (p1 < p2) {
      return 1;
    }
    return 0;
  });
  return arr;
};

const initialState = () => ({
  messages: new Map(),
  duplicateMessageCounter: 0,
});

function messagesReducer(state, action) {
  switch (action.type) {
    case 'ADD_MESSAGE': {
      const { message, readIds } = action;
      if (state.messages.has(message.id)) {
        return {
          ...state,
          duplicateMessageCounter: state.duplicateMessageCounter + 1,
        };
      }
      if (
        message.persistence !== 'repeat' &&
        readIds.indexOf(message.id) !== -1
      ) {
        return state;
      }
      const messages = new Map(state.messages);
      messages.set(message.id, message);
      return { ...state, messages };
    }
    case 'MARK_READ': {
      const { ids } = action;
      // Always return a new state/messages reference, even if none of the
      // ids were tracked in state.messages. Some message-bar items (live
      // service alerts fetched directly by MessageBar, geolocation
      // permission messages from PositionActions) are dismissed via this
      // same markMessageAsRead call but never went through ADD_MESSAGE, so
      // they're never present in state.messages. Bailing out with the same
      // state reference in that case (as before) meant the context value
      // never changed, so components that only subscribe via useMessages()
      // to know "something in the message bar changed" (e.g. NaviContainer,
      // which recomputes layout) never re-rendered when such messages were
      // closed.
      const messages = new Map(state.messages);
      ids.forEach(id => messages.delete(id));
      return { ...state, messages };
    }
    default:
      return state;
  }
}

const MessageContext = createContext({
  messages: [],
  duplicateMessageCounter: 0,
  actions: {
    addMessage: () => {},
    markMessageAsRead: () => {},
  },
});

// Bridge for plain (non-React) modules that still need to add/dismiss
// messages but can't call hooks, e.g. app/action/PositionActions.js's
// Fluxible action creators (geolocation permission/timeout messages).
// MessageProvider fills these in with its real, stable (useCallback with no
// deps) action functions once it mounts; there's only ever one
// MessageProvider instance for the app's lifetime.
const messageActionsBridge = {
  addMessage: () => {},
  markMessageAsRead: () => {},
};

export const messageActions = {
  addMessage: message => messageActionsBridge.addMessage(message),
  markMessageAsRead: ident => messageActionsBridge.markMessageAsRead(ident),
};

export const useMessages = () => useContext(MessageContext).messages;

export const useDuplicateMessageCounter = () =>
  useContext(MessageContext).duplicateMessageCounter;

export const useMessageActions = () => useContext(MessageContext).actions;

export function MessageProvider({ children = null }) {
  const config = useConfigContext();
  const [state, dispatch] = useReducer(
    messagesReducer,
    undefined,
    initialState,
  );

  const addMessage = useCallback(msg => {
    const readIds = getReadMessageIds();
    const message = { ...msg };

    if (!message.id) {
      message.id = JSON.stringify(message);
    }
    dispatch({ type: 'ADD_MESSAGE', message, readIds });
  }, []);

  const markMessageAsRead = useCallback(ident => {
    const ids = Array.isArray(ident) ? ident : [ident];
    const readIds = getReadMessageIds();
    let changed;

    ids.forEach(id => {
      if (readIds.indexOf(id) === -1) {
        readIds.push(id);
        changed = true;
      }
    });
    if (changed) {
      setReadMessageIds(readIds);
    }
    dispatch({ type: 'MARK_READ', ids });
  }, []);

  // Loads static (and, if configured, remotely fetched) messages from
  // config once on mount. This replaces MessageStore's former
  // addConfigMessages(config), previously invoked from client.js before
  // the app's first render; config is stable for the app's lifetime so
  // it's intentionally omitted from the dependency array.
  useEffect(() => {
    const loadConfigMessages = async () => {
      processStaticMessages(config, addMessage);
      if (config.staticMessagesUrl) {
        const response = await fetch(config.staticMessagesUrl, {
          mode: 'cors',
          cache: 'reload',
        });
        const json = await response.json();
        processStaticMessages(json, addMessage);
      }
    };
    loadConfigMessages();
  }, []);

  // Exposes this provider's addMessage/markMessageAsRead to plain (non-React)
  // modules via messageActionsBridge (see above). addMessage/markMessageAsRead
  // are stable (useCallback with no deps), so this only needs to run once.
  useEffect(() => {
    messageActionsBridge.addMessage = addMessage;
    messageActionsBridge.markMessageAsRead = markMessageAsRead;
    return () => {
      messageActionsBridge.addMessage = () => {};
      messageActionsBridge.markMessageAsRead = () => {};
    };
  }, [addMessage, markMessageAsRead]);

  const actions = useMemo(
    () => ({ addMessage, markMessageAsRead }),
    [addMessage, markMessageAsRead],
  );

  const value = useMemo(
    () => ({
      messages: sortMessages(state.messages),
      duplicateMessageCounter: state.duplicateMessageCounter,
      actions,
    }),
    [state, actions],
  );

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
}

MessageProvider.propTypes = {
  children: PropTypes.node,
};

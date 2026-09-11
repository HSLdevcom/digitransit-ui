import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import PropTypes from 'prop-types';
import { isIeOrOldVersion } from '../util/browser';
import { setReadMessageIds, getReadMessageIds } from '../data/localStorage';
import {
  setSessionMessageIds,
  getSessionMessageIds,
} from '../store/sessionStorage';
import { useConfigContext } from '../configurations/ConfigContext';

export const processStaticMessages = (root, callback) => {
  const { staticMessages, staticIEMessage } = root;
  if (Array.isArray(staticIEMessage) && isIeOrOldVersion()) {
    staticIEMessage
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
      const { message, readIds, sessionReadIds } = action;
      if (state.messages.has(message.id)) {
        return {
          ...state,
          duplicateMessageCounter: state.duplicateMessageCounter + 1,
        };
      }
      if (
        (message.persistence !== 'repeat' &&
          readIds.indexOf(message.id) !== -1) ||
        sessionReadIds.indexOf(message.id) !== -1
      ) {
        return state;
      }
      const messages = new Map(state.messages);
      messages.set(message.id, message);
      return { ...state, messages };
    }
    case 'MARK_READ': {
      const { ids } = action;
      let changed = false;
      const messages = new Map(state.messages);
      ids.forEach(id => {
        if (messages.has(id)) {
          messages.delete(id);
          changed = true;
        }
      });
      return changed ? { ...state, messages } : state;
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
    const sessionReadIds = getSessionMessageIds();
    const message = { ...msg };

    if (!message.id) {
      message.id = JSON.stringify(message);
    }
    dispatch({ type: 'ADD_MESSAGE', message, readIds, sessionReadIds });
  }, []);

  const markMessageAsRead = useCallback(ident => {
    const ids = Array.isArray(ident) ? ident : [ident];
    const readIds = getReadMessageIds();
    const sessionReadIds = getSessionMessageIds();
    let changed;
    let sessionChanged;

    ids.forEach(id => {
      // Add staticIEMessage's id to sessionStorage (id 3)
      if (readIds.indexOf(id) === -1 && id !== '3') {
        readIds.push(id);
        changed = true;
      } else if (sessionReadIds.indexOf(id) === -1 && id === '3') {
        sessionReadIds.push(id);
        sessionChanged = true;
      }
    });
    if (changed) {
      setReadMessageIds(readIds);
    }
    if (sessionChanged) {
      setSessionMessageIds(sessionReadIds);
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
      if (config.staticMessagesUrl !== undefined) {
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

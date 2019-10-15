import Store from 'fluxible/addons/BaseStore';
import { getIsBrowser, isIeOrOldVersion } from '../util/browser';
import { setReadMessageIds, getReadMessageIds } from './localStorage';
import { setSessionMessageIds, getSessionMessageIds } from './sessionStorage';

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

class MessageStore extends Store {
  static storeName = 'MessageStore';

  static handlers = {
    AddMessage: 'addMessage',
    UpdateMessage: 'updateMessage',
    MarkMessageAsRead: 'markMessageAsRead',
  };

  constructor(...args) {
    super(...args);
    this.messages = new Map();
  }

  /* Message format:
   * { id: id,
   *   persistence: 'repeat', // default = show once
   *   priority: 2, // high priority should be shown first. Default 0
   *   type: 'error',  // default 'info'
   *   icon: 'geonotifier', // default 'info'
   *   content: {
   *     fi: [ { type:"heading", "content": "foo bar"},
   *           { type:"text", "content": "lorem ipsum..."},
   *           { type:"text", "content": "more lorem ipsum..."},
   *           { type:"a", "content": "this_is_link", "href": <url> }, ..
   *         ],
   *     sv: [ ...], ...
   *   }
   * }
   */

  addMessage = msg => {
    const readIds = getReadMessageIds();
    const sessionReadIds = getSessionMessageIds();
    const message = { ...msg };

    if (!message.id) {
      message.id = JSON.stringify(message);
    }

    if (this.messages.has(message.id)) {
      return;
    }

    if (
      (msg.persistence !== 'repeat' && readIds.indexOf(msg.id) !== -1) ||
      sessionReadIds.indexOf(msg.id) !== -1
    ) {
      return;
    }

    // If message has geojson, it should be triggered when user's origin or destination is in the correct area
    if (message.geoJson) {
      message.shouldTrigger = false;
    } else {
      message.shouldTrigger = true;
    }

    this.messages.set(message.id, message);
    this.emitChange();
  };

  updateMessage = msg => {
    this.messages.set(msg.id, msg);
    this.emitChange();
  };

  addConfigMessages = async config => {
    processStaticMessages(config, this.addMessage);

    if (getIsBrowser() && config.staticMessagesUrl !== undefined) {
      const response = await fetch(config.staticMessagesUrl, {
        mode: 'cors',
        cache: 'reload',
      });
      const json = await response.json();
      processStaticMessages(json, this.addMessage);
    }
  };

  markMessageAsRead = ident => {
    let ids;

    if (Array.isArray(ident)) {
      ids = ident;
    } else {
      ids = [ident];
    }

    let changed;
    let sessionChanged;
    const readIds = getReadMessageIds();
    const sessionReadIds = getSessionMessageIds();
    ids.forEach(id => {
      // Add staticIEMessage's id to sessionStorage (id 3)
      if (readIds.indexOf(id) === -1 && id !== '3') {
        readIds.push(id);
        changed = true;
      } else if (sessionReadIds.indexOf(id) === -1 && id === '3') {
        sessionReadIds.push(id);
        sessionChanged = true;
      }
      if (this.messages.has(id)) {
        this.messages.delete(id);
        changed = true;
      }
    });
    if (changed) {
      setReadMessageIds(readIds);
      this.emitChange();
    }
    if (sessionChanged) {
      setSessionMessageIds(sessionReadIds);
      this.emitChange();
    }
  };

  getReadMessageIds = () => getReadMessageIds();

  getMessages = () => {
    const arr = [];
    this.messages.forEach(msg => {
      arr.push(msg);
    });

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
}

export default MessageStore;

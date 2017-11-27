import Store from 'fluxible/addons/BaseStore';
import { isBrowser } from '../util/browser';
import { setReadMessageIds, getReadMessageIds } from './localStorage';

class MessageStore extends Store {
  static storeName = 'MessageStore';

  static handlers = {
    AddMessage: 'addMessage',
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
    const message = { ...msg };

    if (!message.id) {
      message.id = JSON.stringify(message);
    }

    if (this.messages.has(message.id)) {
      return;
    }

    if (msg.persistence !== 'repeat' && readIds.indexOf(msg.id) !== -1) {
      return;
    }

    this.messages.set(message.id, message);
    this.emitChange();
  };

  addConfigMessages = config => {
    const processStaticMessages = root => {
      if (root.staticMessages) {
        root.staticMessages.forEach(this.addMessage);
      }
    };

    if (isBrowser && config.staticMessagesUrl !== undefined) {
      fetch(config.staticMessagesUrl, {
        mode: 'cors',
        cache: 'reload',
      }).then(response =>
        response.json().then(json => {
          processStaticMessages(json);
        }),
      );
    }
    processStaticMessages(config);
  };

  markMessageAsRead = ident => {
    let ids;

    if (Array.isArray(ident)) {
      ids = ident;
    } else {
      ids = [ident];
    }

    let changed;
    const readIds = getReadMessageIds();
    ids.forEach(id => {
      if (readIds.indexOf(id) === -1) {
        readIds.push(id);
        changed = true;
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
  };

  getReadMessageIds = () => getReadMessageIds();
}

export default MessageStore;

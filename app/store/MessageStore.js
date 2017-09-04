import Store from 'fluxible/addons/BaseStore';
import { isBrowser } from '../util/browser';
import { getMessagesStorage, setMessagesStorage } from './localStorage';

// Save to local storage as an array of key, value pairs
function saveMapToStorage(msgMap) {
  // Spread (...) operator is broken for Map and Set with babel set to loose
  return setMessagesStorage(Array.from(msgMap.entries()));
}

class MessageStore extends Store {
  static storeName = 'MessageStore';

  static handlers = {
    AddMessage: 'addMessage',
    MarkMessageAsRead: 'markMessageAsRead',
  };

  constructor(...args) {
    super(...args);
    this.messages = new Map(getMessagesStorage());
  }

  /* Message format:
   * { id: id,
   *   content: {
   *     fi: {"title":"title", "content": "content"},
   *     sv: {"title":"title", "content": "content"},
   *   }
   * }
   */
  // TODO: Generate message id if missing
  addMessage = msg => {
    const message = { ...msg };
    if (this.messages.has(message.id)) {
      return;
    }

    message.read = false;
    this.messages.set(message.id, message);
    saveMapToStorage(this.messages);
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
    } else {
      processStaticMessages(config.staticMessages);
    }
  };

  markMessageAsRead = id => {
    this.messages.get(id).read = true;
    saveMapToStorage(this.messages);
    this.emitChange();
  };
}

export default MessageStore;

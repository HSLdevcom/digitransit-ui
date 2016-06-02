import Store from 'fluxible/addons/BaseStore';
import { getMessagesStorage, setMessagesStorage } from './localStorage';
import staticMessages from '../staticMessages.js';

// Save to local storage as an array of key, value pairs
function saveMapToStorage(msgMap) {
  return setMessagesStorage([...msgMap]);
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
    staticMessages.forEach(this.addMessage);
  }

  /* Message format:
   * { id: id,
   *   timestamp: 20160101T1200,
   *   priority: 1,
   *   content: { fi: "foo", sv: "bar" }
   * }
   *
   * Lower priority is more important.
   * Unread messages are sorted first by importance first, and then by timestamp.
   * Read messages are sorted by time.
   */
  // TODO: Generate message id if missing
  addMessage = (msg) => {
    const message = { ...msg };
    if (this.messages.has(message.id)) {
      return;
    }

    message.read = false;
    this.messages.set(message.id, message);
    saveMapToStorage(this.messages);
    this.emitChange();
  }

  markMessageAsRead = (id) => {
    this.messages.get(id).read = true;
    saveMapToStorage(this.messages);
    this.emitChange();
  }
}

export default MessageStore;

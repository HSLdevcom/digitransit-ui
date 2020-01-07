import Store from 'fluxible/addons/BaseStore';

class UserStore extends Store {
  static storeName = 'UserStore';

  user = {};

  getUser() {
    return this.user;
  }

  setUser(user) {
    this.user = user;
    this.emitChange();
  }

  static handlers = {
    setUser: 'setUser',
  };
}

export default UserStore;

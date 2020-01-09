class User {
  constructor(data) {
    this.data = data;
  }

  serialize() {
    const x = {
      data: this.data,
    };
    if (this.token) {
      x.token = this.token;
    }
    if (this.idtoken) {
      x.idtoken = this.idtoken;
    }
    return x;
  }

  static unserialize(obj) {
    const u = new User(obj.data);
    if (obj.token) {
      u.token = obj.token;
    }
    if (obj.idtoken) {
      u.idtoken = obj.idtoken;
    }
    return u;
  }
}

exports.User = User;

var db = require('../redis-db');
var shortId = require('shortid');


class Model {

  constructor(members) {
    this.setMembers(members);
  }

  setID(id) {
    this._id = id;

    return this;
  }

  getID() {
    return this._id;
  }

  setMembers(members) {
    this._members = members || {};

    return this;
  }

  getMembers() {
    return this._members;
  }

  setMember(name, value) {
    this._members[name] = value;

    return this;
  }

  getMember(name) {
    return this._members[name];
  }

  static getStorageName() {
    return this.name.toLowerCase();
  }

  save() {
    if (!this.getID()) {
      this.setID(shortId.generate());
    }

    return db.hmset(
      this.constructor.getStorageName() + ':' + this.getID(),
      this.getMembers()
    ).then( () => {
      return db.sadd(this.constructor.getStorageName() + 's:ids', this.getID());
    }).then( () => {
      return this;
    });
  }

  remove() {
    return this.constructor.removeById(this.getID());
  }

  static removeById(id) {
    return db.del(
      this.getStorageName() + ':' + id
    ).then( () => {
      return db.srem(
          this.getStorageName() + 's:ids', id
        );
    });
  }

  static find(id) {
    return db.hgetall(
      this.getStorageName() + ':' + id
    ).then( (members) => {
      if (members) {
        var result = new this(members);
        result.setID(id);
        return result;
      } else {
        return false;
      }
    });
  }

  static exists(id) {
    return db.sismember(this.getStorageName() + 's:ids', id);
  }

}

module.exports = Model;

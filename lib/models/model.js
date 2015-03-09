var db = require('../redis-db');
var shortId = require('shortid');


class Model {

  constructor(members, id) {
    this.setMembers(members);

    if (id) {
      this.setID(id);
    } else {
      this.setID(shortId.generate());
    }

    if (!members || !members.dateAdded) {
      this._members.dateAdded = new Date().getTime();
    }
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

  updateMembers(members) {
    for (let name in members) {
      this._members[name] = members[name];
    }

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

  getDateAdded() {
    return this._members.dateAdded;
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
      return db.sadd(this.constructor.getStorageName() + 's:ids', this.getID()).then(() => {
        return this;
      });
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
        return new this(members, id);
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

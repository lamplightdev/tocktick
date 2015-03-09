var db = require('../redis-db');
var Model = require('./model');


class AuthModel extends Model {
  constructor(members, id, userID) {
    super.constructor(members, id);

    this.setUserID(userID);
  }

  setUserID(userID) {
    this._userID = userID;
  }

  getUserID() {
    return this._userID;
  }

  static getAllForUser(userID) {
    return db.smembers('user:' + userID + ':' + this.constructor.getStorageName() + 's')
      .then((modelIDs) => {
        var promises = [];

        modelIDs.forEach((modelID) => {
          promises.push(this.find(modelID, userID));
        });

        return Promise.all(promises);
      })
      .then((models) => {
        return models.filter((model) => {
          return model !==false;
        });
      });
  }

  static find(id, userID) {
    if (!userID) {
      return Promise.reject(new Error('Missing user info in find'));
    }
    return super.find(id)
      .then(model => {
        model.setUserID(userID);

        return model;
      });
  }

  save() {
    const userID = this.getUserID();

    if (!userID) {
      return Promise.reject(new Error('Missing user info in save'));
    }

    return super.save()
      .then(saved => {
        return db.sadd(
          'user:' + this.getUserID() + ':' + this.constructor.getStorageName() + 's',
          saved.getID()
        ).then(() => {
          return saved;
        });
      });
  }

  remove() {
    return super.remove().then(() => {
      return db.srem(
        'user:' + this.getUserID() + ':' + this.constructor.getStorageName() + 's',
        this.getID()
      );
    });
  }
}

module.exports = AuthModel;

var db = require('../redis-db');
var Model = require('./model');


class AuthModel extends Model {
  constructor(members, id, userID) {
    super.constructor(members, id);

    if (userID) {
      this.setUserID(userID);
    }
  }

  setUserID(userID) {
    this.setMember('userID', userID);

    return this;
  }

  getUserID() {
    return this.getMember('userID');
  }

  static getAllForUser(userID) {
    return db.smembers('user:' + userID + ':' + this.getStorageName() + 's')
      .then((modelIDs) => {
        var promises = [];

        modelIDs.forEach((modelID) => {
          promises.push(this.find(modelID));
        });

        return Promise.all(promises);
      })
      .then((models) => {
        return models.filter((model) => {
          return model !==false;
        });
      });
  }

  save(userID) {
    userID = userID || this.getUserID();

    if (!userID) {
      return Promise.reject(new Error('Missing user info in save'));
    }

    this.setUserID(userID);

    return this.constructor.find(this.getID()).then(model => {
      if (model) {
        return db.sismember(
          'user:' + userID + ':' + this.constructor.getStorageName() + 's',
          this.getID()
        ).then(isOwned => {
          if (!isOwned) {
            return Promise.reject(new Error('User save mismatch'));
          }
          return true;
        });
      }
      return true;
    }).then(() => {
      return super.save()
        .then(saved => {
          return db.sadd(
            'user:' + userID + ':' + this.constructor.getStorageName() + 's',
            saved.getID()
          ).then(() => {
            return saved;
          });
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

var db = require('../redis-db');
var Model = require('./model');
var Job = require('./job');


class User extends Model {

  constructor(members, id) {
    super(members, id);

    this._collections = [
      'timer',
      'job'
    ];
  }

  static findByProvider(provider, providerID) {
    return db.hget(
      this.getProviderKey(provider),
      providerID
    ).then(userID => {
      return userID ? this.find(userID) : false;
    });
  }

  static forProvider(provider, providerID, data) {
    // user:id map
    // users:ids set
    // users:google:providerids map

    return this.findByProvider(provider, providerID)
      .then(user => {
        if (user) {
          return user;
        }

        user = new User(data);

        return user.save()
          .then(user => {
            const job = new Job({
              name: 'My first job'
            });
            return job.save(user.getID());
          }).then(() => {
            return user;
          });
      });
  }

  static getProviderKey(provider) {
    return 'users:' + provider + ':providerids';
  }

  save() {
    const provider = this.getMember('provider');
    const providerID = this.getMember('providerID');

    if (!provider || !providerID) {
      return Promise.reject(new Error('Missing provider info'));
    }

    return super.save()
      .then(savedUser => {
        return db.hset(
          this.constructor.getProviderKey(provider),
          providerID,
          savedUser.getID()
        ).then(() => {
          return savedUser;
        });
      });
  }

  remove() {
    return super.remove().then(() => {
      const promises = [];

      promises.push(db.hdel(
        this.constructor.getProviderKey(),
        this.getMember('providerID')
      ));

      this._collections.forEach((collection) => {
        promises.push(db.del(
          'user:' + this.getID() + ':' + collection + 's'
        ));

        const modelName = collection.charAt(0).toUpperCase() + collection.slice(1);
        global[modelName].getAllForUser(this.getID())
          .then(models => {
            models.forEach(model => {
              promises.push(model.remove());
            });
          });
      });

      return Promise.all(promises);
    });
  }
}


module.exports = User;

var db = require('../redis-db');
var AuthModel = require('./authmodel');


class HasTimersModel extends AuthModel {

  constructor(members, id, userID) {
    super(members, id, userID);
    this._timerIDs = [];
  }

  setTimerIDs(timerIDs) {
    this._timerIDs = timerIDs;
  }

  addTimerID(timerID) {
    this._timerIDs.unshift(timerID);
  }

  removeTimerID(timerID) {
    let index = this._timerIDs.indexOf(timerID);
    if (index > -1) {
      this._timerIDs.splice(index, 1);
    }
  }

  getTimerIDs() {
    return this._timerIDs;
  }

  findTimers()  {
    var Timer = require('./timer');

    return db.smembers(this.constructor.getStorageName() + ':' + this.getID() + ':timers')
      .then((timerIDs) => {
        var promises = [];

        timerIDs.forEach((timerID) => {
          promises.push(
            Timer.find(timerID)
          );
        });

        return Promise.all(promises);
      });
  }

  findRunningTimers() {
    return this.findTimers()
      .then((timers) => {
        return timers.filter((timer) => {
          return timer.isRunning();
        });
      });
  }

  findStoppedTimers() {
    return this.findTimers()
      .then((timers) => {
        return timers.filter((timer) => {
          return timer.isStopped();
        });
      });
  }

  remove() {
    return this.findTimers()
      .then((timers) => {
        var promises = [];

        timers.forEach(timer => {
          promises.push(timer.remove());
        });

        return Promise.all(promises);
      })
      .then(() => {
        return super.remove();
      });
  }

}

module.exports = HasTimersModel;

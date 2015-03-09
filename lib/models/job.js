var db = require('../redis-db');
var AuthModel = require('./authmodel');
var Timer = require('./timer');


class Job extends AuthModel {

  constructor(members, id) {
    super(members, id);
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

  getName() {
    return this.getMember('name');
  }

  findTimers() {
    return db.smembers('job:' + this.getID() + ':timers')
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

module.exports = Job;

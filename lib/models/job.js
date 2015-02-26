var db = require('../redis-db');
var Model = require('./model');
var Timer = require('./timer');


class Job extends Model {

  getName() {
    return this.getMember('name');
  }

  loadTimers() {
    return db.lrange('job:' + this.getID() + ':timers', 0, -1)
      .then((timerIDs) => {
        var promises = [];

        timerIDs.forEach((timerID) => {
          promises.push(
            Timer.find(timerID)
          );
        });

        return Promise.all(promises);
      })
      .then((timers) => {
        this._timers = timers;

        return timers;
      });
  }

  loadRunningTimers() {
    return this.loadTimers()
      .then((timers) => {
        return timers.filter((timer) => {
          return timer.isRunning();
        });
      });
  }

  loadStoppedTimers() {
    return this.loadTimers()
      .then((timers) => {
        return timers.filter((timer) => {
          return timer.isStopped();
        });
      });
  }

  remove() {
    return this.loadTimers()
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

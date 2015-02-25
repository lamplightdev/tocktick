var db = require('../redis-db');
var Model = require('./model');
var Job = require('./job');


class Timer extends Model {

  getDescription() {
    return this.getMember('description');
  }

  getStartTime() {
    return parseInt(this.getMember('start'), 0);
  }

  getStopTime() {
    return parseInt(this.getMember('stop'), 0);
  }

  getDuration() {
    let start = this.getStartTime();
    let stop = this.getStopTime();

    if (start) {
      if (stop) {
        return stop - start;
      } else {
        return this.constructor.getCurrentTime() - start;
      }
    } else {
      return 0;
    }
  }

  adjustDurationFromStart(duration) {
    let start = this.getStartTime();
    let stop = this.getStopTime();

    if (start && stop) {
      this.stop(start + duration);
    } else if (start) {
      this.start(this.constructor.getCurrentTime() - duration);
    }
  }

  adjustDurationFromStop(duration) {
    let start = this.getStartTime();
    let stop = this.getStopTime();

    if (start && stop) {
      this.start(stop - duration);
    }
  }


  start(startTime) {
    this.setMember('start', startTime || this.constructor.getCurrentTime());
  }

  restart() {
    this.start();
  }

  stop(stopTime) {
    if (typeof stopTime === 'undefined') {
      stopTime = this.constructor.getCurrentTime();
    }

    this.setMember('stop', stopTime);
  }

  unstop() {
    this.stop(null);
  }

  isStarted() {
    return !!this.getStartTime();
  }

  isStopped() {
    return !!this.getStopTime();
  }

  isRunning() {
    return this.isStarted() && !this.isStopped();
  }

  static getCurrentTime() {
    return new Date().getTime();
  }

  save(jobID) {
    var currentJobID = this.getMember('jobID');
    this.setMember('jobID', jobID);

    return super.save()
      .then(() => {
        return this.assignToJob(jobID, currentJobID);
      }).then(() => {
        return this;
      });
  }

  assignToJob(jobID, oldJobID) {
    var promises = [];

    if (jobID) {
      promises.push(db.lpush(
        'job:' + jobID + ':timers',
        this.getID()
      ));
    }

    if (oldJobID) {
      promises.push(
        db.lrem('job:' + oldJobID + ':timers', 1, this.getID())
      );
    }

    return Promise.all(promises);
  }

  getJob() {
    var jobID = this.getMember('jobID');
    if (jobID) {
      return Job.find(jobID);
    } else {
      return Promise.resolve(false);
    }
  }

  remove() {
    return super.remove()
      .then(() => {
        return db.lrem('job:' + this.getMember('jobID') + ':timers', 1, this.getID());
      });
  }

}

module.exports = Timer;

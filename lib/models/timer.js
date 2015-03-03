var db = require('../redis-db');
var Model = require('./model');
var Job = require('./job');

var moment = require('moment');

class Timer extends Model {

  setJobID(jobID) {
    this._members.jobID = jobID;
  }

  getJobID() {
    return this._members.jobID;
  }

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

  getFormattedStartTime() {
    return this.constructor.formatTime(this.getStartTime());
  }

  getFormattedStopTime() {
    return this.constructor.formatTime(this.getStopTime());
  }

  getFormattedDuration() {
    return this.constructor.formatDuration(this.getDuration());
  }

  static formatDuration(milliseconds) {
    var m = new moment.duration(milliseconds);

    var parts = [{
      name: 'year',
      value: m.years()
    },{
      name: 'day',
      value: m.days()
    },{
      name: 'hour',
      value: m.hours()
    },{
      name: 'minute',
      value: m.minutes()
    },{
      name: 'second',
      value: m.seconds()
    },];

    var time = '';
    parts.forEach(part => {
      if (part.value > 0 || part.name === 'second') {
        time += part.value;
        time += ' ' + part.name;
        if (part.value !== 1) {
          time += 's';
        }
        time += ' ';
      }
    });

    return time.trim();
  }

  static formatTime(timestamp) {
    var m = new moment(timestamp);
    return m.calendar();
  }

  adjustDurationFromStart(duration) {
    let start = this.getStartTime();
    let stop = this.getStopTime();

    if (start && stop) {
      this.stop(start + duration, true);
    }
  }

  adjustDurationFromStop(duration) {
    let start = this.getStartTime();
    let stop = this.getStopTime();

    if (start && stop) {
      this.start(stop - duration, true);
    }
  }


  start(startTime, force) {
    if (!this.getStartTime() || force) {
      this.setMember('start', startTime || this.constructor.getCurrentTime());
    }

    return this;
  }

  restart() {
    this.start(this.constructor.getCurrentTime(), true);
  }

  stop(stopTime, force) {
    if (this.getStartTime() && (!this.getStopTime() || force)) {
      if (typeof stopTime === 'undefined') {
        stopTime = this.constructor.getCurrentTime();
      }

      this.setMember('stop', stopTime);
    }

    return this;
  }

  unstop() {
    this.stop(null, true);
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

    if (typeof jobID !== 'undefined') {
      this.setMember('jobID', jobID);
    } else {
      jobID = currentJobID;
    }

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
      promises.push(db.lrem(
          'job:' + jobID + ':timers',
          1,
          this.getID()
        ).then(() => {
          db.lpush(
            'job:' + jobID + ':timers',
            this.getID()
          );
        })
      );
    }

    if (oldJobID && oldJobID !== jobID) {
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

  static getMostRecent() {
    //TODO: proper implementation of ids with ordered set so we aren't getting random timer
    return db.srandmember(
      'timers:ids'
    ).then( (timerId) => {
      if (!timerId) {
        return false;
      } else {
        return Timer.find(timerId);
      }
    });
  }

}

module.exports = Timer;

var db = require('../redis-db');
var AuthModel = require('./authmodel');
var Tag = require('./tag');
var Job = require('./job');

var moment = require('moment');


class Timer extends AuthModel {

  constructor(members, tagIDs, id, userID) {
    super(members, id, userID);

    this.setTagIDs(tagIDs);
  }

  static construct(members, id) {
    return new this(members, [], id);
  }

  setTagIDs(tagIDs) {
    this._tagIDs = tagIDs || [];

    return this;
  }

  getTagIDs() {
    return this._tagIDs;
  }

  setJobID(jobID) {
    this.setMember('jobID', jobID);
  }

  getJobID() {
    return this.getMember('jobID');
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

  getFormattedDuration(shortFormat) {
    return this.constructor.formatDuration(this.getDuration(), shortFormat);
  }

  static formatDuration(milliseconds, shortFormat) {
    var m = new moment.duration(milliseconds);

    var parts = [{
      name: 'year',
      value: m.years()
    },{
      name: 'month',
      value: m.months()
    },{
      name: 'week',
      value: m.weeks()
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
        time += ' ' + part.value;
        if (shortFormat) {
          time += part.name.substring(0, 1);
        } else {
          time += ' ' + part.name;
          if (part.value !== 1) {
            time += 's';
          }
        }
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

  copy() {
    const newTimer = new Timer(this.getMembers(), this.getTagIDs());
    newTimer.unstop();
    newTimer.restart();

    return newTimer;
  }

  static duplicate(timerID) {
    return Timer.find(timerID)
      .then(timer => {
        const newTimer = timer.copy();
        return newTimer.save();
      });
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

  save(userID, jobID, currentJobID) {
    currentJobID = currentJobID || this.getMember('jobID');

    if (typeof jobID !== 'undefined') {
      this.setMember('jobID', jobID);
    } else {
      jobID = currentJobID;
    }

    return super.save(userID)
      .then(() => {
        return this.assignToJob(jobID, currentJobID);
      }).then(() => {
        return this.assignTags(this.getTagIDs());
      }).then(() => {
        return this;
      });
  }

  static find(id) {
    return super.find(id)
      .then(timer => {
        if (timer) {
          return Promise.all([timer, timer.findTags()]);
        } else {
          return false;
        }
      })
      .then(result => {
        if (result) {
          let [timer, tags] = result;
          let tagIDs = tags.map(tag => {
            return tag.getID();
          });
          timer.setTagIDs(tagIDs);

          return timer;
        } else {
          return false;
        }
      });
  }

  assignTags(tagIDs) {
    return db.del(this.constructor.getStorageName() + ':' + this.getID() + ':tags')
      .then(() => {
        if (tagIDs.length) {
          return db.sadd(
            this.constructor.getStorageName() + ':' + this.getID() + ':tags',
            tagIDs
          );
        } else {
          return;
        }
      });
  }

  assignToJob(jobID, oldJobID) {
    var promises = [];

    if (jobID) {
      promises.push(db.srem(
          'job:' + jobID + ':timers',
          1,
          this.getID()
        ).then(() => {
          db.sadd(
            'job:' + jobID + ':timers',
            this.getID()
          );
        })
      );
    }

    if (oldJobID && oldJobID !== jobID) {
      promises.push(
        db.srem('job:' + oldJobID + ':timers', 1, this.getID())
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


  findTags() {
    return db.smembers(this.constructor.getStorageName() + ':' + this.getID() + ':tags')
      .then((tagIDs) => {
        var promises = [];

        tagIDs.forEach((tagID) => {
          promises.push(
            Tag.find(tagID)
          );
        });

        return Promise.all(promises).then(tags => {
          return tags.filter(tag => {
            return tag !== false;
          });
        });
      });
  }

  remove() {
    return super.remove()
      .then(() => {
        return db.srem('job:' + this.getMember('jobID') + ':timers', 1, this.getID());
      })
      .then(() => {
        return db.del(this.constructor.getStorageName() + ':' + this.getID() + ':tags');
      });
  }

  static getMostRecent(userID) {
    return db.smembers(
      'user:' + userID + ':timers'
    ).then( (timerIds) => {
      if (!timerIds) {
        return false;
      } else {
        let promises = [];
        timerIds.forEach(timerID => {
          promises.push(Timer.find(timerID));
        });
        return Promise.all(promises).then(timers => {
          timers.sort((a, b) => {
            if (a.getDateAdded() < b.getDateAdded()) {return 1;}
            if (a.getDateAdded() < b.getDateAdded()) {return -1;}
            return 0;
          });

          return timers[0];
        });
      }
    });
  }

}

module.exports = Timer;

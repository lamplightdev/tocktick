var Job = require('./job');
var Timer = require('./timer');

class Group {

  constructor() {
    this.init();
  }

  init() {
    this._jobs = {
      all: {},
      ids: [],
    };

    this._timers = {
      all: {},
      ids: [],
    };
  }

  static fromJSON(jobs, timers) {
    var g = new Group();
    g.loadFromJSON(jobs, timers);

    return g;
  }

  static fromDB(userID) {
    var g = new Group();
    return g.loadFromDB(userID);
  }

  loadFromJSON(jobs, timers) {
    this.init();

    Object.keys(jobs).forEach(jobID => {
      let jobData = jobs[jobID];
      let job = new Job(jobData._members, jobID);

      this.addJob(job);

      jobData._timerIDs.reverse().forEach(timerID => {
        let timer = new Timer(timers[timerID]._members, timerID);
        this.addTimer(timer);
      });
    });

    this.sortTimers();
  }

  loadFromDB(userID) {
    this.init();

    return Job.getAllForUser(userID)
      .then(jobs => {
        let promises = [];
        jobs.forEach(job => {
          this.addJob(job);
          promises.push(job.findTimers());
        });

        this.sortJobs();

        return Promise.all(promises);
      })
      .then(jobTimers => {
        jobTimers.forEach(timers => {
          timers.forEach(timer => {
            this.addTimer(timer);
          });
        });

        this.sortTimers();

        return this;
      });
  }

  getJobInfo() {
    return this._jobs;
  }

  getTimerInfo() {
    return this._timers;
  }

  getJobs() {
    return this._jobs.all;
  }

  getJobIDs() {
    return this._jobs.ids;
  }

  getTimers() {
    return this._timers.all;
  }

  getTimerIDs() {
    return this._timers.ids;
  }

  sortTimers() {
    this._timers.ids.sort((a, b) => {
      let aStart = this._timers.all[a].getStartTime();
      let bStart = this._timers.all[b].getStartTime();

      if (aStart < bStart) { return 1; }
      if (aStart > bStart) { return -1; }
      return 0;
    });
  }

  sortJobs() {
    this._jobs.ids.sort((a, b) => {
      let aStart = this._jobs.all[a].getDateAdded();
      let bStart = this._jobs.all[b].getDateAdded();

      if (aStart < bStart) { return 1; }
      if (aStart > bStart) { return -1; }
      return 0;
    });
  }

  getOrderedTimers(limit) {
    let ordered = [];

    let count = 0;
    this._timers.ids.forEach(id => {
      if (!limit || count<limit) {
        ordered.push(this._timers.all[id]);
      }
      count++;
    });

    return ordered;
  }

  getCurrentTimers(limit) {
    let ordered = [];

    let count = 0;
    this._timers.ids.forEach(id => {
      if (this._timers.all[id].isRunning() && (!limit || count<limit) ) {
        ordered.push(this._timers.all[id]);
        count++;
      }
    });

    return ordered;
  }

  getNumCurrentTimers() {
    let count = 0;

    this._timers.ids.forEach(id => {
      if (this._timers.all[id].isRunning()) {
        count++;
      }
    });

    return count;
  }

  getOrderedJobTimers(jobID) {
    var ordered = [];

    this._jobs.all[jobID].getTimerIDs().forEach(timerID => {
      ordered.push(this._timers.all[timerID]);
    });

    return ordered;
  }

  getOrderedJobs(limit) {
    let ordered = [];

    let count = 0;
    this._jobs.ids.forEach(id => {
      if (!limit || count<limit) {
        ordered.push(this._jobs.all[id]);
      }
      count++;
    });

    return ordered;
  }

  timerExists(timerID) {
    return !!this._timers.all[timerID];
  }

  findTimer(timerID) {
    if (this.timerExists(timerID)) {
      return this._timers.all[timerID];
    } else {
      return false;
    }
  }

  jobExists(jobID) {
    return !!this._jobs.all[jobID];
  }

  findJob(jobID) {
    if (this.jobExists(jobID)) {
      return this._jobs.all[jobID];
    } else {
      return false;
    }
  }

  getMostRecentTimer() {
    if (this._timers.ids.length) {
      return this.getOrderedTimers()[0];
    } else {
      return false;
    }
  }

  getMostRecentJob() {
    if (this._jobs.ids.length) {
      return this.getOrderedJobs()[0];
    } else {
      return false;
    }
  }

  addJob(job) {
    this._jobs.all[job.getID()] = job;
    this._jobs.ids.unshift(job.getID());
  }


  removeJob(job) {
    var index = this._jobs.ids.indexOf(job.getID());
    if (index > -1) {
      this._jobs.ids.splice(index, 1);
    }
    delete this._jobs.all[job.getID()];
  }

  addOrUpdateTimer(timer) {
    if (this._timers.all[timer.getID()]) {
      this.updateTimer(timer);
    } else {
      this.addTimer(timer);
    }
  }

  addTimer(timer) {
    this._timers.all[timer.getID()] = timer;
    this._timers.ids.unshift(timer.getID());

    this._jobs.all[timer.getMember('jobID')].addTimerID(timer.getID());
  }

  updateTimer(timer) {
    this._timers.all[timer.getID()] = timer;
  }

  removeTimer(timer) {
    var index = this._timers.ids.indexOf(timer.getID());
    if (index > -1) {
      this._timers.ids.splice(index, 1);
    }

    this._jobs.all[timer.getMember('jobID')].removeTimerID(timer.getID());

    delete this._timers.all[timer.getID()];
  }

  startNewTimer(timerData) {
    let timer;

    if (!timerData.jobID) {
      let recentTimer = this.getMostRecentTimer();

      let jobID;
      if (!recentTimer) {
        let recentJob = this.getMostRecentJob();

        if (!recentJob) {
          let job = new Job({
            name: 'New Job'
          });
          this.addJob(job);
          jobID = job.getID();
        } else {
          jobID = recentJob.getID();
        }
      } else {
        jobID = recentTimer.getMember('jobID');
      }

      timer = new Timer({
        jobID: jobID
      });
    } else {
      timer = new Timer(timerData);
    }

    this.addTimer(timer);

    timer.start();

    return timer;
  }

  stopTimer(timer) {
    timer.stop();

    return timer;
  }
}

module.exports = Group;

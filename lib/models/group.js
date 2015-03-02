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
      current: false,
    };
  }

  static fromJSON(jobs, timers) {
    var g = new Group();
    g.loadFromJSON(jobs, timers);

    return g;
  }

  static fromDB() {
    var g = new Group();
    return g.loadFromDB();
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

        if(timer.isRunning()) {
          this.setCurrent(timer);
        }
      });
    });
  }

  loadFromDB() {
    this.init();

    return Job.getAllForUser()
      .then(jobs => {
        let promises = [];
        jobs.forEach(job => {
          this.addJob(job);
          promises.push(job.loadTimers());
        });

        return Promise.all(promises);
      })
      .then(jobTimers => {
        jobTimers.forEach(timers => {
          timers.reverse().forEach(timer => {
            this.addTimer(timer);
            if (timer.isRunning()) {
                this.setCurrent(timer);
            }
          });
        });

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

  getTimers() {
    return this._timers.all;
  }

  getOrderedTimers() {
    let ordered = [];

    this._timers.ids.forEach(id => {
      ordered.push(this._timers.all[id]);
    });

    return ordered;
  }

  getOrderedJobTimers(jobID) {
    var ordered = [];

    this._jobs.all[jobID].getTimerIDs().forEach(timerID => {
      ordered.push(this._timers.all[timerID]);
    });

    return ordered;
  }

  getOrderedJobs() {
    let ordered = [];

    this._jobs.ids.forEach(id => {
      ordered.push(this._jobs.all[id]);
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

  setCurrent(timer) {
    this._timers.current = timer;
  }

  getCurrent() {
    return this._timers.current;
  }

  getMostRecentTimer() {
    if (this._timers.ids.length) {
      return this._timers.all[this._timers.ids[0]];
    } else {
      return false;
    }
  }

  addJob(job) {
    this._jobs.all[job.getID()] = job;
    this._jobs.ids.unshift(job.getID());
  }

  addTimer(timer) {
    this._timers.all[timer.getID()] = timer;
    this._timers.ids.unshift(timer.getID());

    this._jobs.all[timer.getMember('jobID')].addTimerID(timer.getID());
  }

  startNewTimer(timerData) {
    let timer;

    if (!timerData.jobID) {
      let recentTimer = this.getMostRecentTimer();

      let jobID;
      if (!recentTimer) {
        let job = new Job({
          name: 'New Job'
        });
        this.addJob(job);
        jobID = job.getID();
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
    this.setCurrent(timer);

    return timer;
  }

  stopCurrentTimer() {
    var timer = this.getCurrent();
    timer.stop();

    this.setCurrent(false);

    return timer;
  }
}

module.exports = Group;

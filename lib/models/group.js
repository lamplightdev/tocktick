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

      jobData._timerIDs.forEach(timerID => {
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
          timers.forEach(timer => {
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

  setCurrent(timer) {
    this._timers.current = timer;
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

  startNewTimer() {
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

    var timer = new Timer({
      jobID: jobID
    });
    this.addTimer(timer);

    timer.start();
    this.setCurrent(timer);

    this._view.setDirty('all');
    this._view.render(this._getViewData());

    return timer;
  }
}

module.exports = Group;

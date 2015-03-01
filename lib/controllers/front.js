'use strict';

var shortId = require('shortid');

var Controller = require('./controller');
var ViewFront = require('../views/front');
var Timer = require('../models/timer');
var Job = require('../models/job');


class ControllerFront extends Controller {

  _initView() {
    if (!this._view) {
      this._view = new ViewFront(this._container, this._templates, {
        onTimerStartSubmit: () => {
          let result = this.timerStartSubmit();
          if (this._callbacks.onTimerStartSubmit) {
            this._callbacks.onTimerStartSubmit(result);
          }
          return result;
        },
        onTimerStartResponse: (timer) => {
          let result = this.timerStartResponse(timer);
          if (this._callbacks.onTimerStartResponse) {
            this._callbacks.onTimerStartResponse(result);
          }
          return result;
        },

        onTimerStopSubmit: () => {
          let result = this.timerStopSubmit();
          if (this._callbacks.onTimerStopSubmit) {
            this._callbacks.onTimerStopSubmit(result);
          }
          return result;
        },
        onTimerStopResponse: (timer) => {
          let result = this.timerStopResponse(timer);
          if (this._callbacks.onTimerStopResponse) {
            this._callbacks.onTimerStopResponse(result);
          }
          return result;
        },
      });
    }
  }

  timerStartSubmit() {
    let jobID;
    let recentTimer = this._data.timers[0];

    if (recentTimer) {
      jobID = recentTimer.getMember('jobID');
    } else {
      jobID = shortId.generate();
      let job = new Job({
        name: 'New Job'
      });
      job.setID(jobID);
      this._data.jobs.unshift(job);
    }

    var timer = new Timer({
      jobID: jobID
    });

    this._data.jobs.forEach(job => {
      if (job.getID() === jobID) {
        timer._job = job;
        if (job._timers) {
          job._timers.unshift(timer);
        } else {
          job.timers = [timer];
        }
      }
    });

    timer.setID(shortId.generate());
    timer.start();

    this._data.timers.unshift(timer);
    this._data.currentTimerIndex = 0;

    this._view.setDirty('all');
    this._view.render(this._getViewData());

    return timer;
  }

  timerStartResponse(timerData) {
    console.log('timerStartResponse');
    /*
    var t = new Timer(timerData._members);
    t.setID(timerData._id);

    this._data.timers.unshift(t);
    this._data.currentTimerIndex = 0;

    var jobFound = false;
    this._data.jobs.forEach(job => {
      if(job.getID() === t.getMember('jobID')) {
        jobFound = true;
        job._timers.push(t);
        t._job = job;
      }
    });

    if (!jobFound) {
      let job = new Job(timerData._job._members);
      job.setID(timerData._job._id);
      job._timers = [t];
      t._job = job;
      this._data.jobs.unshift(job);
    }
    */
  }

  startTimer(id, jobID, description, startTime) {
    let promises = [];

    if (id) {
      promises.push(Timer.find(id));
    } else {
      promises.push(Promise.resolve(false));
    }

    promises.push(Job.find(jobID));

    return Promise.all(promises)
      .then(results => {
        let [timer, job] = results;
        let promise;

        if (!job) {
          //try and get most recent timer
          promise = Timer.getMostRecent().then(recentTimer => {
            if (!recentTimer) {
              job = new Job({
                name: 'New Job'
              });
              return job.save().then(() => {
                return Promise.resolve([timer, job]);
              });
            } else {
              return Job.find(recentTimer.getMember('jobID')).then(job => {
                return Promise.resolve([timer, job]);
              });
            }
          });
        } else {
          promise = Promise.resolve([timer, job]);
        }

        return promise;
      })
      .then(results => {
        console.log(results);
        let [timer, job] = results;
        if (!timer) {
          timer = new Timer({
            jobID: job.getID(),
            description: description
          });
          timer.setID(id);
        }
        timer._job = job;
        return timer.start(startTime);
      })
      .then(timer => {
        return timer.save();
      })
      .then(null, (err) => {
        console.log(err);
      });
  }

  timerStopSubmit() {
    this._data.timers[this._data.currentTimerIndex].stop();

    this._data.currentTimerIndex = false;

    this._view.setDirty('all');
    this._view.render(this._getViewData());

    return this._data.timers[0];
  }

  timerStopResponse(timerData) {
    console.log('timerStopResponse');
  }

  stopTimer(id, stopTime) {
    return Timer.find(id)
      .then(timer => {
        return timer.stop(stopTime);
      })
      .then(timer => {
        return timer.save();
      });
  }

}

module.exports = ControllerFront;

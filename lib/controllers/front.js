'use strict';

var Controller = require('./controller');
var ViewFront = require('../views/front');
var Timer = require('../models/timer');
var Job = require('../models/job');

class ControllerFront extends Controller {

  _initView() {
    if (!this._view) {
      this._view = new ViewFront(this._container, this._templates, {
        onTimerStarted: (timer) => {
          this.timerStarted(timer);

          if (this._callbacks.onTimerStarted) {
            this._callbacks.onTimerStarted(timer);
          }
        },

        onTimerStopped: (timer) => {
          this.timerStopped(timer);

          if (this._callbacks.onTimerStopped) {
            this._callbacks.onTimerStopped(timer);
          }
        }
      });
    }
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
          job = new Job({
            name: 'New Job'
          });
          promise = job.save().then(() => {
            return Promise.resolve([timer, job]);
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

  timerStarted(timer) {
    var timerEl = this._container.querySelector('.timer');
    timerEl.classList.remove('timer--init');
    timerEl.classList.remove('timer--stopped');
    timerEl.classList.add('timer--running');

    var t = new Timer(timer._members);
    t.setID(timer._id);

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
      let job = new Job(timer._job._members);
      job.setID(timer._job._id);
      job._timers = [t];
      t._job = job;
      this._data.jobs.unshift(job);
    }

    this._view.setDirty('all');
    this._view.render(this._getViewData());
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

  timerStopped(timer) {
    let timerEl = this._container.querySelector('.timer');
    timerEl.classList.remove('timer--init');
    timerEl.classList.remove('timer--running');
    timerEl.classList.add('timer--stopped');

    let t = new Timer(timer._members);
    t.setID(timer._id);
    t._job = this._data.timers[this._data.currentTimerIndex]._job;

    this._data.timers[this._data.currentTimerIndex] = t;

    this._data.currentTimerIndex = false;

    this._view.setDirty('all');
    this._view.render(this._getViewData());
  }

}

module.exports = ControllerFront;

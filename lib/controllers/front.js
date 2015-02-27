'use strict';

var Controller = require('./controller');
var ViewFront = require('../views/front');
var Timer = require('../models/timer');

class ControllerFront extends Controller {

  constructor(data, templates, container, callbacks) {
    super(data, templates, container, callbacks);

    this._initView();
  }

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
    let promise;

    if (id) {
      promise = Timer.find(id);
    } else {
      promise = Promise.resolve();
    }

    return promise
      .then(timer => {
        if (!timer) {
          timer = new Timer({
            jobID: jobID,
            description: description
          });
          timer.setID(id);
        }
        return timer.start(startTime);
      })
      .then(timer => {
        return timer.save();
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

    this._data.jobs.forEach(job => {
      if(job.getID() === t.getMember('jobID')) {
        job._timers.push(t);
        t._job = job;
      }
    });

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

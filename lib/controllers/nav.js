'use strict';

var Controller = require('./controller');
var ViewNav = require('../views/nav');
var Timer = require('../models/timer');
var Job = require('../models/job');


class ControllerNav extends Controller {

  constructor(data, templates, container, callbacks) {
    super(data, templates, container, callbacks);

    this._initView();
  }

  _initView() {
    if (!this._view) {
      this._view = new ViewNav(this._container, this._templates, {
        onTimerStarted: (timer) => {
          this.timerStarted(timer);

          if (this._callbacks.onTimerStarted) {
            this._callbacks.onTimerStarted(timer);
          }
        },
      });
    }
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

    this._view.setDirty('nav-timer');
    this._view.render(this._getViewData());
  }

}

module.exports = ControllerNav;

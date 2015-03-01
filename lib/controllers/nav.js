'use strict';

var shortId = require('shortid');

var Controller = require('./controller');
var ViewNav = require('../views/nav');
var Timer = require('../models/timer');
var Job = require('../models/job');


class ControllerNav extends Controller {

  _initView() {
    if (!this._view) {
      this._view = new ViewNav(this._container, this._templates, {
        onTimerStartSubmit: () => {
          let result = this.timerStartSubmit();
          if (this._callbacks.onTimerStartSubmit) {
            this._callbacks.onTimerStartSubmit(result);
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

}

module.exports = ControllerNav;

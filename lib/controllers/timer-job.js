'use strict';


var Controller = require('./controller');
var ViewTimerJob = require('../views/timer-job');


class ControllerTimerJob extends Controller {

  _initView(container, templates) {
    if (!this._view) {
      this._view = new ViewTimerJob(container, templates, {
        onJobSelected: ((jobID) => {
          this._data.timer.setJobID(jobID);
          if (this._callbacks.onJobSelected) {
            this._callbacks.onJobSelected(jobID);
          }
        }).bind(this),
      });
    }
  }

}

module.exports = ControllerTimerJob;

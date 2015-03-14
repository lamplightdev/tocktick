'use strict';


var Controller = require('./controller');
var ViewTimerEdit = require('../views/timer-edit');


class ControllerTimerEdit extends Controller {

  _initView(container, templates) {
    if (!this._view) {
      this._view = new ViewTimerEdit(container, templates, {
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

module.exports = ControllerTimerEdit;

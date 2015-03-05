'use strict';

var Controller = require('./controller');
var ViewTimers = require('../views/timers');


class ControllerTimers extends Controller {

  _initView() {
    if (!this._view) {
      this._view = new ViewTimers(this._container, this._templates, {
        onTimerStopSubmit: (timer) => {
          this.timerStopSubmit(timer);
          if (this._callbacks.onTimerStopSubmit) {
            this._callbacks.onTimerStopSubmit(timer);
          }
          return timer;
        },
        onTimerStopResponse: (timerData) => {
          let result = this.timerStopResponse(timerData);
          if (this._callbacks.onTimerStopResponse) {
            this._callbacks.onTimerStopResponse(result);
          }
          return result;
        },

        onTimerUpdateSubmit: (timer, members) => {
          this.timerUpdateSubmit(timer, members);
          if (this._callbacks.onTimerUpdateSubmit) {
            this._callbacks.onTimerUpdateSubmit(timer);
          }
          return timer;
        },
        onTimerUpdateResponse: (timerData) => {
          let result = this.timerUpdateResponse(timerData);
          if (this._callbacks.onTimerUpdateResponse) {
            this._callbacks.onTimerUpdateResponse(result);
          }
          return result;
        },

        onTimerDeleteSubmit: (timer) => {
          this.timerDeleteSubmit(timer);
          if (this._callbacks.onTimerDeleteSubmit) {
            this._callbacks.onTimerDeleteSubmit(timer);
          }
          return timer;
        },
        onTimerDeleteResponse: (success) => {
          let result = this.timerDeleteResponse(success);
          if (this._callbacks.onTimerDeleteResponse) {
            this._callbacks.onTimerDeleteResponse(success);
          }
          return result;
        },
      });
    }
  }

  timerStopSubmit(timer) {
    timer.stop();

    this._view.setDirty('all');
    this._view.render(this._getViewData());

    return timer;
  }

  timerStopResponse(timerData) {
    console.log('timerStopResponse', timerData);
  }

  timerUpdateSubmit(timer, members) {
    timer.updateMembers(members);

    this._view.setDirty('all');
    this._view.render(this._getViewData());

    return timer;
  }

  timerUpdateResponse(timerData) {
    console.log('timerUpdateResponse', timerData);
  }

  timerDeleteSubmit(timer) {
    let success = this._data.grouped.removeTimer(timer);

    this._view.setDirty('all');
    this._view.render(this._getViewData());

    return success;
  }

  timerDeleteResponse(success) {
    console.log('timerDeleteResponse', success);
  }
}

module.exports = ControllerTimers;

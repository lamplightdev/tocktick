'use strict';

var Controller = require('./controller');
var ControllerTimerEdit = require('./timer-edit');
var ViewTimers = require('../views/timers');


class ControllerTimers extends Controller {

  _initView(container, templates) {
    if (!this._view) {

      this.initPaging();

      this._view = new ViewTimers(container, templates, {
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

        onTimerUpdateSubmit: (timer, members, tagIDs) => {
          this.timerUpdateSubmit(timer, members, tagIDs);
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

        onTimerEditOpen: (id) => {
          if (this._callbacks.onTimerEditOpen) {
            this._callbacks.onTimerEditOpen(id);
          }
        },

        onTimerEditClose: (id) => {
          if (this._callbacks.onTimerEditClose) {
            this._callbacks.onTimerEditClose(id);
          }
        },

        onTimerDetailsClick: (timerID, container) => {
          this.timerDetailsClicked(timerID, container);
        },

        onLoadMore: () => {
          this.incrementPaging();
          this.getView().loadMore(this.getViewData());
        }
      });
    }
  }

  initPaging() {
    this.addExtraData({
      timerPaging: {
        current: 0,
        length: 10
      }
    });
  }

  incrementPaging() {
    this._extraData.timerPaging.current++;
  }

  resetPaging() {
    this._extraData.timerPaging.current = 0;
  }

  timerStopSubmit(timer) {
    timer.stop();

    this._view.renderElement('timer-list-item--' + timer.getID(), 'timer-item', timer, this.getViewData());

    return timer;
  }

  timerStopResponse(timerData) {
    console.log('timerStopResponse', timerData);
  }

  timerUpdateSubmit(timer, members, tagIDs) {
    timer.updateMembers(members).setTagIDs(tagIDs);

    //this._view.setDirty('all');
    //this._view.render(this.getViewData());
    this._view.renderElement('timer-list-item--' + timer.getID(), 'timer-item', timer, this.getViewData());

    return timer;
  }

  timerUpdateResponse(timerData) {
    console.log('timerUpdateResponse', timerData);
  }

  timerDeleteSubmit(timer) {
    let success = this._data.grouped.removeTimer(timer);

    this._view.removeElement('timer-list-item--' + timer.getID());

    return success;
  }

  timerDeleteResponse(success) {
    console.log('timerDeleteResponse', success);
  }

  timerDetailsClicked(timerID, container) {
    const ctrlr = new ControllerTimerEdit({
      timer: this._data.grouped.findTimer(timerID),
      jobs: this._data.grouped.getOrderedJobs()
    }, App.templates, container, {
      onJobSelected: (function () {
        this.jobSelected(ctrlr._data.timer);
      }).bind(this)
    });

    ctrlr.renderView();
  }

  jobSelected(timer) {
    this.getView().renderTimerItemEdit(timer, this.getViewData());
  }
}

module.exports = ControllerTimers;

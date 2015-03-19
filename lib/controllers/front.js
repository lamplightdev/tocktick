'use strict';

var Controller = require('./controller');
var ControllerTimerEdit = require('./timer-edit');
var ViewFront = require('../views/front');
var Timer = require('../models/timer');
var Job = require('../models/job');


class ControllerFront extends Controller {

  _initView(container, templates) {

    if (!this._view) {
      this._view = new ViewFront(container, templates, {
        onTimerStartSubmit: (timerData) => {
          let result = this.timerStartSubmit(timerData);
          if (this._callbacks.onTimerStartSubmit) {
            this._callbacks.onTimerStartSubmit(result);
          }
          return result;
        },
        onTimerStartResponse: (timerData) => {
          let result = this.timerStartResponse(timerData);
          if (this._callbacks.onTimerStartResponse) {
            this._callbacks.onTimerStartResponse(result);
          }
          return result;
        },

        onTimerDetailsClick: (timerID, container) => {
          this.timerDetailsClicked(timerID, container);
        }
      });
    }
  }

  getViewData() {
    let recentJob = this._data.grouped.getMostRecentJob();
    let recentTimer = this._data.grouped.getMostRecentTimer();

    if (recentTimer) {
      recentJob = this._data.grouped.findJob(recentTimer.getJobID());
    }

    return Object.assign({},
      super.getViewData(),
      {
        recentJob: recentJob
      }
    );
  }

  timerStartSubmit(timerData) {
    let timer = this._data.grouped.startNewTimer(timerData);

    this._view.setDirty('all');
    this._view.render(this.getViewData());

    return timer;
  }

  timerStartResponse(timerData) {
    console.log('timerStartResponse', timerData);
  }

  startTimer(id, jobID, description, startTime) {
    //TODO: add as middleware
    if (!this._data.user) {
      return Promise.reject(new Error("No user"));
    }

    let userID = this._data.user.getID();

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
        return timer.save(userID);
      })
      .then(null, err => {
        return Promise.reject(err);
      });
  }

  stopTimer(id, stopTime) {
    return Timer.find(id)
      .then(timer => {
        return timer.stop(stopTime);
      })
      .then(timer => {
        return timer.save(this._data.user.getID());
      });
  }

  updateTimer(id, members, tagIDs) {
    let currentJobID;

    return Timer.find(id)
      .then(timer => {
        currentJobID = timer.getJobID();
        timer.updateMembers(members);
        timer.setTagIDs(tagIDs);
        return timer;
      })
      .then(timer => {
        return timer.save(this._data.user.getID(), timer.getJobID(), currentJobID);
      });
  }

  deleteTimer(id) {
    return Timer.find(id)
      .then(timer => {
        timer.remove();

        return timer;
      });
  }

  timerDetailsClicked(timerID, container) {
    const ctrlr = new ControllerTimerEdit({
      timer: this._data.timer,
      jobs: this._data.grouped.getOrderedJobs()
    }, App.templates, container, {
      onJobSelected: (this.jobSelected).bind(this)
    });

    ctrlr.renderView();
  }

  jobSelected() {
    this.getView().setDirty('all');
    this.renderView();
  }
}

module.exports = ControllerFront;

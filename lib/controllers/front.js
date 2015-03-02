'use strict';

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
    var timer = this._data.grouped.startNewTimer();

    this._view.setDirty('all');
    this._view.render(this._getViewData());

    return timer;
  }

  timerStartResponse(timerData) {
    console.log('timerStartResponse', timerData);
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
    let timer = this._data.grouped.stopCurrentTimer();

    this._view.setDirty('all');
    this._view.render(this._getViewData());

    return timer;
  }

  timerStopResponse(timerData) {
    console.log('timerStopResponse', timerData);
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

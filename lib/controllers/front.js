'use strict';

var Controller = require('./controller');
var ViewFront = require('../views/front');
var Timer = require('../models/timer');
var Job = require('../models/job');


class ControllerFront extends Controller {

  _initView() {
    if (!this._view) {
      this._view = new ViewFront(this._container, this._templates, {
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
        }
      });
    }
  }

  _getViewData() {
    let recentJob = this._data.grouped.getMostRecentJob();
    let recentTimer = this._data.grouped.getMostRecentTimer();

    if (recentTimer) {
      recentJob = this._data.grouped.findJob(recentTimer.getJobID());
    } else {
      if (!recentJob) {
        recentJob = new Job({
          name: 'New Job'
        });
      }
    }

    return Object.assign({},
      super._getViewData(),
      {
        recentJob: recentJob
      }
    );
  }

  timerStartSubmit(timerData) {
    let timer = this._data.grouped.startNewTimer(timerData);

    this._view.setDirty('all');
    this._view.render(this._getViewData());

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
        let promise;

        if (!job) {
          if (jobID) {
            job = new Job({
              name: 'New Job'
            }, jobID);

            promise = job.save(userID).then(() => {
              return Promise.resolve([timer, job]);
            });
          } else {
            //try and get most recent timer
            //TODO: if no recent timer, get most recently added job?
            promise = Timer.getMostRecent(userID).then(recentTimer => {
              if (!recentTimer) {
                job = new Job({
                  name: 'New Job'
                });
                return job.save(userID).then(() => {
                  return Promise.resolve([timer, job]);
                });
              } else {
                return Job.find(recentTimer.getMember('jobID')).then(job => {
                  return Promise.resolve([timer, job]);
                });
              }
            });
          }
        } else {
          promise = Promise.resolve([timer, job]);
        }

        return promise;
      })
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

  updateTimer(id, members) {
    let currentJobID;

    return Timer.find(id)
      .then(timer => {
        currentJobID = timer.getJobID();
        return timer.updateMembers(members);
      })
      .then(timer => {
        return timer.save(this._data.user.getID(), timer.getJobID(), currentJobID);
      });
  }

  deleteTimer(id) {
    return Timer.find(id)
      .then(timer => {
        timer.remove();
      });
  }
}

module.exports = ControllerFront;

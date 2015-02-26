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
        }
        console.log(timer);
        return timer.start(startTime);
      })
      .then(timer => {
        return timer.save();
      });
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

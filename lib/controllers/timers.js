'use strict';

var Controller = require('./controller');
var ViewTimers = require('../views/timers');


class ControllerTimers extends Controller {

  _initView() {
    if (!this._view) {
      this._view = new ViewTimers(this._container, this._templates, {
      });
    }
  }

}

module.exports = ControllerTimers;

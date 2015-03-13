'use strict';


var Controller = require('./controller');
var ViewTimerEdit = require('../views/timer-edit');


class ControllerTimerEdit extends Controller {

  _initView(container, templates) {
    if (!this._view) {
      this._view = new ViewTimerEdit(container, templates, {
      });
    }
  }

}

module.exports = ControllerTimerEdit;

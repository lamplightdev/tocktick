'use strict';

var Controller = require('./controller');
var ViewApp = require('../views/app');
var ViewTimerEdit = require('../views/timer-edit');


class ControllerApp extends Controller {

  _initView() {
    if (!this._view) {
      this._view = new ViewApp(this._container, this._templates, {
      });
    }
  }

  initViewTimerEdit() {
    if (!this._viewTimerEdit) {
      this._viewTimerEdit = new ViewTimerEdit(this._container.querySelector('.timer-edit'), this._templates, {

      });
    }
  }

  showTimerEdit(timer) {

  }

  showOverlay() {

  }

  hideOverlay() {

  }
}

module.exports = ControllerApp;

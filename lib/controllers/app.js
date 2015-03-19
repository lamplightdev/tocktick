'use strict';

var Controller = require('./controller');
var ViewApp = require('../views/app');

var Timer = require('../models/timer');


class ControllerApp extends Controller {

  _initView(container, templates) {
    if (!this._view) {
      this._view = new ViewApp(container, templates, {
      });
    }
  }

  removeTimer(timerData) {
    let timer = new Timer(timerData._members, timerData._tagIDs, timerData._id);
    this._data.grouped.removeTimer(timer);
  }

  addOrUpdateTimer(timerData) {
    let timer = new Timer(timerData._members, timerData._tagIDs, timerData._id);
    this._data.grouped.addOrUpdateTimer(timer);
  }

}

module.exports = ControllerApp;

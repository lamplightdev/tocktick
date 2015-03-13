'use strict';

var Controller = require('./controller');
var ViewApp = require('../views/app');


class ControllerApp extends Controller {

  _initView(container, templates) {
    if (!this._view) {
      this._view = new ViewApp(container, templates, {
      });
    }
  }

}

module.exports = ControllerApp;

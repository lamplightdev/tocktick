'use strict';


var Controller = require('./controller');
var ViewTimerAdjust = require('../views/timer-adjuster');


class ControllerTimerAdjuster extends Controller {

  _initView(container, templates) {
    if (!this._view) {
      this._view = new ViewTimerAdjust(container, templates, {
        onDone: (() => {
          this._callbacks.onDone();
        }).bind(this),
      });
    }
  }

}

module.exports = ControllerTimerAdjuster;

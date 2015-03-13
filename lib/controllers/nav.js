'use strict';


var Controller = require('./controller');
var ViewNav = require('../views/nav');


class ControllerNav extends Controller {

  _initView() {
    if (!this._view) {
      this._view = new ViewNav(this._container, this._templates, {
        onTimerStartSubmit: (timerData) => {
          let result = this.timerStartSubmit(timerData);
          if (this._callbacks.onTimerStartSubmit) {
            this._callbacks.onTimerStartSubmit(result);
          }
          return result;
        },
      });
    }
  }

  timerStartSubmit(timerData) {
    var timer = this._data.grouped.startNewTimer(timerData);

    this._view.setDirty('all');
    this._view.render(this.getViewData());

    return timer;
  }

}

module.exports = ControllerNav;

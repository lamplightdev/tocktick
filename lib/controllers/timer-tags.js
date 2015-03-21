'use strict';


var Controller = require('./controller');
var ViewTimerTags = require('../views/timer-tags');


class ControllerTimerTags extends Controller {

  _initView(container, templates) {
    if (!this._view) {
      this._view = new ViewTimerTags(container, templates, {
        onDone: (tagIDs => {
          this._data.timer.setTagIDs(tagIDs);
          this._callbacks.onDone();
        }).bind(this),
      });
    }
  }

}

module.exports = ControllerTimerTags;

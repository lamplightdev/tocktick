'use strict';

var RouterShared = require('./shared');
var ControllerTimers = require('../controllers/timers');


class RouterSharedTimers extends RouterShared {

  initController() {
    return new ControllerTimers(this._data, this._templates, this._container, this._callbacks);
  }

  getMatched(route, routeParts, queryString) {
    let matched = false;

    if (route === '') {

        matched = true;

    } else {

      if (routeParts.length === 1) {
        matched = this._data.grouped.timerExists(routeParts[0]);
      }

    }

    return matched;
  }
}

module.exports = RouterSharedTimers;

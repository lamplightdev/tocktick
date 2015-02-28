'use strict';

var RouterShared = require('./shared');
var ControllerTimers = require('../controllers/timers');


class RouterSharedTimers extends RouterShared {

  initController() {
    return new ControllerTimers(this._data, this._data.templates, this._container, this._callbacks);
  }

  getMatched(route, routeParts, queryString) {

    switch(true) {
      case route==='':
        return true;
    }
  }
}

module.exports = RouterSharedTimers;

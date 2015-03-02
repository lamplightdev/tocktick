'use strict';

var RouterShared = require('./shared');
var ControllerTimers = require('../controllers/timers');


class RouterSharedTimers extends RouterShared {

  initController() {
    return new ControllerTimers(this._data, this._templates, this._container, this._callbacks);
  }

  getMatched(route, routeParts, queryString) {
    switch(true) {
      case route==='':
        return true;
      case routeParts[0] === 'QJiOkK8O':
        return true;
    }
  }
}

module.exports = RouterSharedTimers;

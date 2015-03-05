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

        matched = {
          name: 'base'
        };

    } else {

      if (routeParts.length === 1) {

        if (this._data.grouped.timerExists(routeParts[0])) {
          matched = {
            name: 'timer',
            id: routeParts[0]
          };
        }

      } else if (routeParts.length === 2) {

        if (routeParts[0] === 'edit') {

          if (this._data.grouped.timerExists(routeParts[1])) {
            matched = {
              name: 'timer-edit',
              id: routeParts[1]
            };
          }

        }
      }

    }

    return matched;
  }
}

module.exports = RouterSharedTimers;

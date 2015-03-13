'use strict';

var Router = require('./router');


class RouterTimers extends Router {

  static getMatched(route, routeParts, queryString) {
    let matched = false;

    if (route === '') {

        matched = {
          name: 'base'
        };

    } else {

      if (routeParts.length === 1) {

        matched = {
          name: 'timer',
          id: routeParts[0]
        };

      } else if (routeParts.length === 2) {

        if (routeParts[0] === 'edit') {

          matched = {
            name: 'timer-edit',
            id: routeParts[1]
          };

        }
      }

    }

    return matched;
  }
}

module.exports = RouterTimers;

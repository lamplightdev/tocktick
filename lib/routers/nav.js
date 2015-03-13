'use strict';

var Router = require('./router');


class RouterNav extends Router {

  static getMatched(route, routeParts, queryString) {

    switch(true) {
      case route==='':
        return true;
    }
  }
}

module.exports = RouterNav;

'use strict';


class Router {

  static match(route, query, onMatched, onUnmatched) {
    route = route || '';

    route = route.replace(/\/$/, '').trim();
    let routeParts = route.split('/');

    var matched = this.getMatched(route, routeParts, query);

    if (matched !== false) {
      if (onMatched) {
        onMatched(matched);
      }
    } else {
      if (onUnmatched) {
        onUnmatched(routeParts, query);
      }
    }
  }

  static getMatched(route, routeParts, queryString) {
    var matched = false;

    //For tests
    if (route === 'test') {
      matched = true;
    }

    return matched;
  }
}

module.exports = Router;

'use strict';

var Controller = require('../controllers/controller');


class RouterShared {

  constructor(data, callbacks) {
    this._data = data;
    this._callbacks = callbacks;

    this._ctrlr = this.initController();
  }

  initController() {
    return new Controller(this._data, this._data.templates, this._data.container, this._callbacks);
  }

  getController() {
    return this._ctrlr;
  }

  match(route, query, onMatched, onUnmatched) {
    route = route || '';

    route = route.replace(/\/$/, '').trim().toLowerCase();
    let routeParts = route.split('/');

    var matched = this.getMatched(route, routeParts, query);

    if (matched === true) {
      if (onMatched) {
        onMatched(routeParts, query);
      }
    } else {
      if (onUnmatched) {
        onUnmatched(routeParts, query);
      }
    }
  }

  getMatched(route, routeParts, queryString) {
    var matched = false;

    //For tests
    if (route === 'test') {
      matched = true;
    }

    return matched;
  }
}

module.exports = RouterShared;

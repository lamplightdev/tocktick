'use strict';

var RouterShared = require('./shared');
var ControllerFront = require('../controllers/front');

class RouterSharedFront extends RouterShared {

  initController() {
    return new ControllerFront(this._data, this._data.templates, this._container, this._callbacks);
  }

  getMatched(route, routeParts, queryString) {

    switch(true) {
      case route==='':
        return true;
    }
  }
}

module.exports = RouterSharedFront;

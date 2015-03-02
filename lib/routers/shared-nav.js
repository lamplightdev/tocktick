'use strict';

var RouterShared = require('./shared');
var ControllerNav = require('../controllers/nav');

class RouterSharedNav extends RouterShared {

  initController() {
    return new ControllerNav(this._data, this._templates, this._container, this._callbacks);
  }

  getMatched(route, routeParts, queryString) {

    switch(true) {
      case route==='':
        return true;
    }
  }
}

module.exports = RouterSharedNav;

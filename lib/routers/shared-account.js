'use strict';

var RouterShared = require('./shared');
var ControllerAccount = require('../controllers/account');

class RouterSharedAccount extends RouterShared {

  initController() {
    return new ControllerAccount(this._data, this._templates, this._container, this._callbacks);
  }

  getMatched(route, routeParts, queryString) {

    switch(true) {
      case route==='':
        return true;
    }
  }
}

module.exports = RouterSharedAccount;

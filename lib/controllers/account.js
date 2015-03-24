'use strict';

var Controller = require('./controller');
var ViewAccount = require('../views/account');



class ControllerAccount extends Controller {

  _initView(container, templates) {
    if (!this._view) {
      this._view = new ViewAccount(container, templates);
    }
  }

}

module.exports = ControllerAccount;

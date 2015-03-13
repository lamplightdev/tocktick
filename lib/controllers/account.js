'use strict';

var Controller = require('./controller');
var ViewAccount = require('../views/account');

var Job = require('../models/job');

class ControllerAccount extends Controller {

  _initView(container, templates) {
    if (!this._view) {
      this._view = new ViewAccount(container, templates, {
      });
    }
  }

  addJob(members) {
    let j = new Job(members);
    return j.save(this._data.user.getID());
  }

}

module.exports = ControllerAccount;

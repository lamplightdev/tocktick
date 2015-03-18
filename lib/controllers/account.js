'use strict';

var Controller = require('./controller');
var ViewAccount = require('../views/account');

var Job = require('../models/job');
var Tag = require('../models/tag');


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

  addTag(members) {
    let t = new Tag(members);
    return t.save(this._data.user.getID());
  }

}

module.exports = ControllerAccount;

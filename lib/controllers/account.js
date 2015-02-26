'use strict';

var Controller = require('./controller');
var ViewAccount = require('../views/account');

var Job = require('../models/job');
var Timer = require('../models/timer');

class ControllerAccount extends Controller {

  constructor(data, templates, container, callbacks) {
    super(data, templates, container, callbacks);

    this._initView();
  }

  _initView() {
    if (!this._view) {
      this._view = new ViewAccount(this._container, this._templates, {
      });
    }
  }

  addJob(members) {
    let j = new Job(members);
    return j.save();
  }

  addTimer(members) {
    let t = new Timer(members);
    return t.save();
  }

}

module.exports = ControllerAccount;

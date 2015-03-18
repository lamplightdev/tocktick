'use strict';

var Controller = require('./controller');
var ViewAccount = require('../views/account');

var Job = require('../models/job');
var Tag = require('../models/tag');


class ControllerAccount extends Controller {

  _initView(container, templates) {
    if (!this._view) {
      this._view = new ViewAccount(container, templates, {
        onJobAddSubmit: jobData => {
          let result = this.jobAddSubmit(jobData);
          if (this._callbacks.onJobAddSubmit) {
            this._callbacks.onJobAddSubmit(result);
          }
          return result;
        },
        onTagAddSubmit: tagData => {
          let result = this.tagAddSubmit(tagData);
          if (this._callbacks.onTagAddSubmit) {
            this._callbacks.onTagAddSubmit(result);
          }
          return result;
        },
      });
    }
  }

  addJob(id, members) {
    //TODO: add as middleware
    if (!this._data.user) {
      return Promise.reject(new Error("No user"));
    }

    let userID = this._data.user.getID();

    let j = new Job(members);
    return j.save(userID);
  }

  addTag(id, members) {
    //TODO: add as middleware
    if (!this._data.user) {
      return Promise.reject(new Error("No user"));
    }

    let userID = this._data.user.getID();

    let t = new Tag(members);
    return t.save(userID);
  }

  jobAddSubmit(jobData) {
    console.log(jobData);

    let job = new Job(jobData);
    this._data.grouped.addJob(job);

    this._view.setDirty('all');
    this._view.render(this.getViewData());

    return job;
  }

  tagAddSubmit(tagData) {
    console.log(tagData);

    let tag = new Tag(tagData);
    this._data.grouped.addTag(tag);

    this._view.setDirty('all');
    this._view.render(this.getViewData());

    return tag;
  }

}

module.exports = ControllerAccount;

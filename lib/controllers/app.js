'use strict';

var Controller = require('./controller');
var ViewApp = require('../views/app');

var Timer = require('../models/timer');
var Job = require('../models/job');
var Tag = require('../models/tag');


class ControllerApp extends Controller {

  _initView(container, templates) {
    if (!this._view) {
      this._view = new ViewApp(container, templates, {
      });
    }
  }

  removeTimer(timerData) {
    let timer = new Timer(timerData._members, timerData._tagIDs, timerData._id);
    this._data.grouped.removeTimer(timer);
  }

  addOrUpdateTimer(timerData) {
    let timer = new Timer(timerData._members, timerData._tagIDs, timerData._id);
    this._data.grouped.addOrUpdateTimer(timer);
  }

  addJob(members, id) {
    //TODO: add as middleware
    if (!this._data.user) {
      return Promise.reject(new Error("No user"));
    }

    let userID = this._data.user.getID();

    let j = new Job(members, id);
    return j.save(userID);
  }

  addTag(members, id) {
    //TODO: add as middleware
    if (!this._data.user) {
      return Promise.reject(new Error("No user"));
    }

    let userID = this._data.user.getID();

    let t = new Tag(members, id);
    return t.save(userID);
  }

  deleteJob(id) {
    return Job.find(id)
      .then(job => {
        job.remove();

        return job;
      });
  }

  deleteTag(id) {
    return Tag.find(id)
      .then(tag => {
        tag.remove();

        return tag;
      });
  }
}

module.exports = ControllerApp;

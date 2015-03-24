'use strict';

var Controller = require('./controller');
var ViewProjects = require('../views/projects');

var Job = require('../models/job');
var Tag = require('../models/tag');


class ControllerProjects extends Controller {

  _initView(container, templates) {
    if (!this._view) {
      this._view = new ViewProjects(container, templates, {
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
        onJobDeleteSubmit: job => {
          let result = this.jobDeleteSubmit(job);
          if (this._callbacks.onJobDeleteSubmit) {
            this._callbacks.onJobDeleteSubmit(result);
          }
          return result;
        },
        onJobDeleteResponse: job => {

        },
        onTagDeleteSubmit: tag => {
          let result = this.tagDeleteSubmit(tag);
          if (this._callbacks.onTagDeleteSubmit) {
            this._callbacks.onTagDeleteSubmit(result);
          }
          return result;
        },
        onTagDeleteResponse: tag => {

        },
      });
    }
  }

  jobAddSubmit(jobData) {
    let job = new Job(jobData);
    this._data.grouped.addJob(job);

    this._view.setDirty('all');
    this._view.render(this.getViewData());

    return job;
  }

  tagAddSubmit(tagData) {
    let tag = new Tag(tagData);
    this._data.grouped.addTag(tag);

    this._view.setDirty('all');
    this._view.render(this.getViewData());

    return tag;
  }

  jobDeleteSubmit(job) {
    this._data.grouped.removeJob(job);

    this._view.setDirty('all');
    this._view.render(this.getViewData());

    return job;
  }

  tagDeleteSubmit(tag) {
    this._data.grouped.removeTag(tag);

    this._view.setDirty('all');
    this._view.render(this.getViewData());

    return tag;
  }
}

module.exports = ControllerProjects;

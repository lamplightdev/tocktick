'use strict';

var View = require('../views/view');

class Controller {

  constructor(models, templates, container, callbacks) {
    this._data = models;
    this._callbacks = callbacks || {};

    this._extraData = {};

    this._view = null;

    templates = templates || {};
    this._initView(container, templates);
  }

  setExtraData(data) {
    this._extraData = data;
  }

  addExtraData(data) {
    Object.assign(this._extraData, data);
  }

  setData(data) {
    Object.assign(this._data, data);
  }

  getViewData() {
    return Object.assign({}, this._data, this._extraData);
  }

  getView() {
    return this._view;
  }

  initView(container, templates) {
    if (!this._view) {
      this._view = new View(container, templates, {

      });
    }
  }

  renderView(preRendered) {
    this._initView();

    this._view.render(this.getViewData(), preRendered);
  }
}

module.exports = Controller;

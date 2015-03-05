'use strict';

var View = require('../views/view');

class Controller {

  constructor(data, templates, container, callbacks) {
    this._data = data;
    this._templates = templates || [];
    this._container = container;
    this._callbacks = callbacks || {};

    this._view = null;
    this._initView();
  }

  _getViewData() {
    return this._data;
  }

  getView() {
    return this._view;
  }

  initView() {
    if (!this._view) {
      this._view = new View(this._container, this._templates, {

      });
    }
  }

  renderView(preRendered) {
    this._initView();

    this._view.render(this._getViewData(), preRendered);
  }
}

module.exports = Controller;

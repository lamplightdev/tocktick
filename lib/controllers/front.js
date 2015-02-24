'use strict';

var Controller = require('./controller');
var ViewFront = require('../views/front');


class ControllerFront extends Controller {

  constructor(data, templates, container, callbacks) {
    super(data, templates, container, callbacks);

    this._initView();
  }

  _initView() {
    if (!this._view) {
      this._view = new ViewFront(this._container, this._templates, {
      });
    }
  }

}

module.exports = ControllerFront;

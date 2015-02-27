'use strict';

var Controller = require('./controller');
var ViewNav = require('../views/nav');


class ControllerNav extends Controller {

  constructor(data, templates, container, callbacks) {
    super(data, templates, container, callbacks);

    this._initView();
  }

  _initView() {
    if (!this._view) {
      this._view = new ViewNav(this._container, this._templates, {
      });
    }
  }

}

module.exports = ControllerNav;

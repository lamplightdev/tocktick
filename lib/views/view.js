'use strict';

var Handlebars = require("../../node_modules/handlebars/dist/handlebars.runtime");
var request = require('then-request');

class View {

  constructor(container, parts, callbacks) {
    this._setContainer(container);

    this._parts = parts;

    this._callbacks = callbacks || {};

    this._isDirty = {
      all: true,
    };

    for (let i=0; i<this._parts.length; i++) {
      this._isDirty[this._parts[i].name] = true;
    }
  }

  _setContainer(container) {
    this._container = container;
  }

  setDirty(name) {
    this._isDirty[name] = true;
  }

  render(data, preRendered) {

    if(this._isDirty.all) {
      if (!preRendered) {
        var compiled = Handlebars.template(this._parts.all.template);
        this._container.innerHTML = compiled(data);
      }

      if (this._parts.all.postRender) {
        this._parts.all.postRender(data);
      }

      for (let part in this._isDirty) {
        this._isDirty[part] = false;
      }

    } else {

      for (let part in this._isDirty) {
        if (part !== 'all' && this._isDirty[part]) {
          this.renderPart(part, data, this._parts[part].postRender);
        }
      }
    }
  }

  renderPart(name, data, postRender) {
    var compiled = Handlebars.template(this._parts[name].template);
    this._container.querySelector('.' + name).innerHTML = compiled(data);

    if (postRender) {
      postRender(data);
    }

    this._isDirty[name] = false;
  }

  submitForm(form, method, action) {
    method = method || form.dataset.apiMethod || form.method;
    action = action || form.dataset.apiAction || form.action;

    var data = {};
    var qs = {};

    var vars = {};

    for(let i=0; i<form.elements.length; i++) {
        vars[form.elements[i].name] = form.elements[i].value;
    }

    if (method.toLowerCase() === 'get') {
      qs = vars;
    } else {
      data = vars;
    }

    return request(method, action, {
        json: data,
        qs: qs
    }).then((res) => {
      return JSON.parse(res.getBody());
    }, (err) => {
      Error(err);
      console.log('form error: ', err);
    });
  }
}

module.exports = View;

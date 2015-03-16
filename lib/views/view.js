'use strict';

var Handlebars = require("../../node_modules/handlebars/dist/handlebars.runtime");
var request = require('then-request');
var localStorage = localStorage;  //needed so we can rewire localStorage in tests

class View {

  constructor(container, parts, callbacks) {
    this.setContainer(container);
    this.initParts(parts);
    this.setCallbacks(callbacks);
  }

  setContainer(container) {
    this._container = container;
    return this;
  }

  getContainer() {
    return this._container;
  }

  setParts(parts) {
    this._parts = parts;
    return this;
  }

  getParts() {
    return this._parts;
  }

  initParts(parts) {
    this.setParts(parts);

    this._isDirty = {};

    this.setDirty('all');

    for (let key in this._parts) {
      this.setDirty(this._parts[key].name);
    }

    return this;
  }

  setDirty(name) {
    this._isDirty[name] = true;
    return this;
  }

  getDirty() {
    return this._isDirty;
  }

  setCallbacks(callbacks) {
    this._callbacks = callbacks || {};
    return this;
  }

  getCallbacks() {
    return this._callbacks;
  }

  enableJSVersion() {
    let hides = this._container.querySelectorAll(".hide-for-js-version");
    for (let i=0; i<hides.length; i++) {
      //hides[i].classList.add('hide');
    }
  }

  render(data, preRendered) {

    if(this._isDirty.all) {
      if (!preRendered) {
        var template = Handlebars.template(this._parts.all.template);
        this.removeContainerEventListeners();
        this._container.innerHTML = template(data);
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
    var template = Handlebars.template(this._parts[name].template);
    var el = this._container.querySelector('.' + name);
    el.outerHTML = template(data);

    if (postRender) {
      postRender(data);
    }

    this._isDirty[name] = false;
  }

  renderElement(name, templateName, data, rootData, postRender) {
    var template = Handlebars.template(App.templates[templateName]);
    var el = this._container.querySelector('.' + name);
    el.outerHTML = template(data, {data: {root: rootData}});

    if (postRender) {
      postRender(data);
    }
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
      if (res.statusCode === 0) {
        let queue = localStorage.getItem('api-queue');
        if (!queue) {
          queue = [];
        } else {
          queue = JSON.parse(queue);
        }
        queue.push({
          method: method,
          action: action,
          data: data,
          qs: qs,
        });
        localStorage.setItem('api-queue', JSON.stringify(queue));
      }
      return JSON.parse(res.getBody());
    }, (err) => {
      Error(err);
      console.log('form error: ', err);
    });
  }

  registerContainerEventListener(type, listener) {
    this._container.children[0].addEventListener(type, listener, true);

    if (!this._parts.all.eventListeners) {
      this._parts.all.eventListeners = [];
    }

    this._parts.all.eventListeners.push({
      type: type,
      listener: listener
    })
  }

  removeContainerEventListeners() {
    // need to remove these on each _container render otherwise they will be bound twice
    const eventListeners = this._parts.all.eventListeners;
    if (eventListeners) {
      for (let i=0; i<eventListeners.length; i++) {
        this._container.children[0].removeEventListener(eventListeners[i].type, eventListeners[i].listener, true);
      }
    }
  }


}

module.exports = View;

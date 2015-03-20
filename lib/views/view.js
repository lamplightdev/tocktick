'use strict';

var Handlebars = require("../../node_modules/handlebars/dist/handlebars.runtime");
var vParser = require('../then-virtual-html');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var h = require('virtual-dom/h');
var createElement = require('virtual-dom/create-element');

var request = require('then-request');
var localStorage = localStorage;  //needed so we can rewire localStorage in tests

class View {

  constructor(container, parts, callbacks) {
    this.setContainer(container);
    this.initParts(parts);
    this.setCallbacks(callbacks);

    this._rootNode = null;
    this._vDom = null;
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

    if(true || this._isDirty.all) {
      if (true || !preRendered) {
        var template = Handlebars.template(this._parts.all.template);
        this.removeContainerEventListeners();
        let t = template(data, {data: false});


        return vParser(t).then(dom => {
          eval('dom = ' + dom);
          if (!this._rootNode) {
            this._rootNode = createElement(dom);
            this._container.innerHTML = '';
            this._container.appendChild(this._rootNode);
          } else {
            const patches = diff(this._vDom, dom);
            this._rootNode = patch(this._rootNode, patches);

            if(!this._rootNode.parentNode) {
              this._container.innerHTML = '';
              this._container.appendChild(this._rootNode);
            }
          }

          this._vDom = dom;

          if (this._parts.all.postRender) {
            this._parts.all.postRender(data);
          }

          this._isDirty.all = false;
        });
      } else {
        if (this._parts.all.postRender) {
          this._parts.all.postRender(data);
        }

        this._isDirty.all = false;
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
      const el = form.elements[i];
      switch(el.type) {
        case 'checkbox':
          if (!vars[el.name]) {
            vars[el.name] = [];
          }
          if (el.checked) {
            vars[el.name].push(el.value);
          }
          break;
        default:
          vars[el.name] = el.value;
          break;
      }
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
    this._rootNode.addEventListener(type, listener);

    if (!this._parts.all.eventListeners) {
      this._parts.all.eventListeners = [];
    }

    this._parts.all.eventListeners.push({
      type: type,
      listener: listener
    });
  }

  removeContainerEventListeners() {
    // need to remove these on each _container render otherwise they will be bound twice
    const eventListeners = this._parts.all.eventListeners;
    if (eventListeners) {
      for (let i=0; i<eventListeners.length; i++) {
        this._rootNode.removeEventListener(eventListeners[i].type, eventListeners[i].listener);
      }
    }
  }


}

module.exports = View;

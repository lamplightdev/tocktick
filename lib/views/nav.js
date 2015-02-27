'use strict';

var shortId = require('shortid');

var View = require("./view");
var Timer = require('../models/timer');


class ViewNav extends View {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'nav-outer',
        template: templates['nav-outer'],
        postRender: (data) => {
          this.initTimerStart(data);
        },
      },
      'nav': {
        name: 'nav',
        template: templates.nav,
        postRender: (data) => {
        },
      },
      'nav-timer': {
        name: 'nav-timer',
        template: templates['nav-timer'],
        postRender: (data) => {
          this.initTimerStart(data);
        },
      },
    }, callbacks);
  }

  initTimerStart(data) {
    console.log('initTimerStart');

    var form = this._container.querySelector(".nav-form-start");

    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();

        // we want time button was clicked on client, rather than time
        // when server received request (think offline functioning)
        form.elements.actiontime.value = Timer.getCurrentTime();

        // need to create an id on the client since we maybe offline
        form.dataset.apiAction += '/' + shortId.generate();

        this.submitForm(form).then((result) => {
          if (this._callbacks.onTimerStarted) {
            this._callbacks.onTimerStarted(result);
          }
        });
      });
    }
  }

}

module.exports = ViewNav;

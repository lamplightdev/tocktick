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

        let timer = this._callbacks.onTimerStartSubmit();

        form.elements.actiontime.value = timer.getStartTime();
        form.dataset.apiAction += '/' + timer.getID();

        this.submitForm(form).then((timerData) => {
          this._callbacks.onTimerStartResponse(timerData);
        });
      });
    }
  }

}

module.exports = ViewNav;

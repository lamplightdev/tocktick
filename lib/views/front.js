'use strict';

var shortId = require('shortid');

var View = require("./view");

var Timer = require('../models/timer');

class ViewFront extends View {
  constructor(container, templates, callbacks) {

    super(container, {
      'all': {
        name: 'front',
        template: templates.front,
        postRender: data => {
          this.initStartStop();
        },
      },
    }, callbacks);
  }

  initStartStop() {
    console.log('initStartStop');

    var form = this._container.querySelector(".front-form-startstop");

    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();

        // we want time button was clicked on client, rather than time
        // when server received request (think offline functioning)
        form.elements.actiontime.value = Timer.getCurrentTime();

        // need to create an id on the client since we maybe offline
        if (form.elements.type.value === 'start') {
          form.dataset.apiAction += '/' + shortId.generate();
        }

        this.submitForm(form).then((result) => {
          if (form.elements.type.value === 'start') {
            if (this._callbacks.onTimerStarted) {
              this._callbacks.onTimerStarted(result);
            }
          } else if (form.elements.type.value === 'stop') {
            if (this._callbacks.onTimerStopped) {
              this._callbacks.onTimerStopped(result);
            }
          }
        });
      });
    }
  }

}

module.exports = ViewFront;

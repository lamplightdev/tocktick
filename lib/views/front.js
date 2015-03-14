'use strict';

var View = require("./view");


class ViewFront extends View {
  constructor(container, templates, callbacks) {

    super(container, {
      'all': {
        name: 'front',
        template: templates.front,
        postRender: data => {
          this.enableJSVersion();
          this.initStartTimer();
          this.initTimerDetails();
        },
      },
    }, callbacks);
  }

  initStartTimer() {
    console.log('initStartTimer front');

    const form = this._container.querySelector(".front-form-start");

    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();

        let timer = this._callbacks.onTimerStartSubmit({
          jobID: form.elements.jobid.value,
          description: form.elements.description.value,
        });

        form.elements.actiontime.value = timer.getStartTime();
        form.elements.jobid.value = timer.getJobID();
        form.dataset.apiAction += '/' + timer.getID();

        this.submitForm(form).then((timerData) => {
          this._callbacks.onTimerStartResponse(timerData);
        });
      });
    }
  }

  initTimerDetails() {
    console.log('initTimerDetails front');

    const button = this._container.querySelector(".front-form-start .selectme");

    if (button) {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        if (this._callbacks.onTimerDetailsClick) {
          this._callbacks.onTimerDetailsClick(button.dataset.timerId, this._container.querySelector('.front-timer-edit'));
        }
      });
    }
  }

}

module.exports = ViewFront;

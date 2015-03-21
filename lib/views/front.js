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

    this.registerContainerEventListener('submit', (event) => {
      if (event.target.classList.contains('front-form-start')) {
        event.preventDefault();

        const form = event.target;
        const vars = this.serializeForm(form.elements);

        let timer = this._callbacks.onTimerStartSubmit({
          description: vars.description,
          jobID: vars.jobid,
        }, vars['tags[]']);

        form.elements.actiontime.value = timer.getStartTime();
        form.dataset.apiAction += '/' + timer.getID();

        this.submitForm(form).then((timerData) => {
          this._callbacks.onTimerStartResponse(timerData);
        });
      }
    });
  }

  initTimerDetails() {
    console.log('initTimerDetails front');

    this.registerContainerEventListener('click', (event) => {
      if (event.target.classList.contains('selectme')) {
        event.preventDefault();

        const button = event.target;

        if (this._callbacks.onTimerDetailsClick) {
          this._callbacks.onTimerDetailsClick(button.dataset.timerId, this._container.querySelector('.front-timer-edit'));
        }
      }
    });
  }

}

module.exports = ViewFront;

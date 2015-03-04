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
          this.initStartTimer(data);
        },
      },
    }, callbacks);
  }

  initStartTimer(data) {
    console.log('initStartTimer front');

    var form = this._container.querySelector(".front-form-start");

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

}

module.exports = ViewFront;

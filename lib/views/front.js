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
          this.initTimerJobEdit();
          this.initTimerTagsEdit(data);
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

  initTimerJobEdit() {
    console.log('initTimerJob front');

    this.registerContainerEventListener('click', (event) => {
      if (event.target.classList.contains('selectme')) {
        event.preventDefault();

        const button = event.target;

        if (this._callbacks.onTimerJobClick) {
          this._callbacks.onTimerJobClick(button.dataset.timerId, this._container.querySelector('.front-timer-job'));
        }
      }
    });
  }

  initTimerTagsEdit(data) {
    console.log('initTimerTagsEdit front');

    this.registerContainerEventListener('click', event => {
      if (event.target.classList.contains('edittags')) {
        event.preventDefault();

        const timerID = event.target.dataset.timerId;
        if (this._callbacks.onTimerTagsClick) {
          this._callbacks.onTimerTagsClick(timerID, this._container.querySelector('.front-timer-tags'));
        }
      }
    });
  }

}

module.exports = ViewFront;

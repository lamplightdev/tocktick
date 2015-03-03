'use strict';

var View = require("./view");


class ViewFront extends View {
  constructor(container, templates, callbacks) {

    super(container, {
      'all': {
        name: 'front',
        template: templates.front,
        postRender: data => {
          this.initStartStop(data);
          this.initTimerUpdate(data);
        },
      },
    }, callbacks);
  }

  initStartStop(data) {
    console.log('initStartStop');

    var form = this._container.querySelector(".front-form-startstop");

    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (form.elements.type.value === 'start') {

          let timer = this._callbacks.onTimerStartSubmit({
            jobID: form.elements.jobid.value,
            description: form.elements.description.value,
          });

          let timerEl = this._container.querySelector('.timer');
          timerEl.classList.remove('timer--init');
          timerEl.classList.remove('timer--stopped');
          timerEl.classList.add('timer--running');


          form.elements.actiontime.value = timer.getStartTime();
          form.dataset.apiAction += '/' + timer.getID();

          this.submitForm(form).then((timerData) => {
            this._callbacks.onTimerStartResponse(timerData);
          });

        } else if (form.elements.type.value === 'stop') {

          let timer = this._callbacks.onTimerStopSubmit();

          let timerEl = this._container.querySelector('.timer');
          timerEl.classList.remove('timer--init');
          timerEl.classList.remove('timer--running');
          timerEl.classList.add('timer--stopped');

          form.elements.actiontime.value = timer.getStopTime();

          this.submitForm(form).then((timerData) => {
            this._callbacks.onTimerStopResponse(timerData);
          });

        }
      });
    }
  }

  initTimerUpdate(data) {
    let $timeElapsed = this._container.querySelector('.timer-time');
    let timer = data.grouped.getCurrent();

    if (timer) {
      this.updateTimer(timer, 0, $timeElapsed);
    }
  }

  updateTimer(timer, lastDuration, $timeElapsed) {
    var duration = timer.getDuration();
    if (duration - lastDuration > 1000) {
      $timeElapsed.textContent = timer.getFormattedDuration();
      lastDuration = duration;
    }

    window.requestAnimationFrame((this.updateTimer).bind(this, timer, lastDuration, $timeElapsed));
  }

}

module.exports = ViewFront;

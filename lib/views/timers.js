'use strict';

var View = require("./view");


class ViewTimers extends View {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'timers',
        template: templates.timers,
        postRender: (data) => {
          this.initTimerUpdate(data);
          this.initTimerStop(data);
        },
      },
    }, callbacks);
  }

  initTimerUpdate(data) {
    let timer = data.grouped.getCurrent();

    if (timer) {
      let $timeElapsed = this._container.querySelector('.timer-list-item--' + timer.getID() + ' .timer-list-item__timings__duration span');
      this.updateTimer(timer, 0, $timeElapsed);
    }
  }

  updateTimer(timer, lastDuration, $timeElapsed) {
    var duration = timer.getDuration();
    if (timer.isRunning() && duration - lastDuration > 1000) {
      $timeElapsed.textContent = timer.getFormattedDuration(true);
      lastDuration = duration;
    }

    window.requestAnimationFrame((this.updateTimer).bind(this, timer, lastDuration, $timeElapsed));
  }

  initTimerStop(data) {
    console.log('initTimerStop');

    var forms = this._container.querySelectorAll(".timer-list-item__actions__stop");

    for (let i=0; i<forms.length; i++) {
      let form = forms[i];
      let timerID = form.dataset.timerId;

      if (data.grouped._timers.all[timerID]) {
        let timer = data.grouped._timers.all[timerID];

        form.addEventListener('submit', (event) => {
          event.preventDefault();

          this._callbacks.onTimerStopSubmit(timer);

          form.elements.actiontime.value = timer.getStopTime();

          this.submitForm(form).then((timerData) => {
            this._callbacks.onTimerStopResponse(timerData);
          });

        });

      }
    }

  }

}

module.exports = ViewTimers;

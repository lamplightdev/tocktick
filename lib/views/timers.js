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
    let timers = data.grouped.getCurrentTimers();

    if (timers.length) {
      let timerData = [];

      for (let i=0 ; i<timers.length; i++) {
        timerData.push({
          timer: timers[i],
          $el: this._container.querySelector('.timer-list-item--' + timers[i].getID() + ' .timer-list-item__timings__duration span'),
          lastDuration: 0
        });
      }

      this.updateTimers(timerData);
    }
  }

  updateTimers(timerDatas) {
    for (let i=0; i<timerDatas.length; i++) {
      let timerData = timerDatas[i];

      var duration = timerData.timer.getDuration();
      if (timerData.timer.isRunning() && duration - timerData.lastDuration > 1000) {
        timerData.$el.textContent = timerData.timer.getFormattedDuration(true);
        timerData.lastDuration = duration;
      }
    }

    window.requestAnimationFrame((this.updateTimers).bind(this, timerDatas));
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

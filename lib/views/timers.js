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
        },
      },
    }, callbacks);
  }

  initTimerUpdate(data) {
    let timer = data.grouped.getCurrent();

    if (timer) {
      let $timeElapsed = this._container.querySelector('.timer-list-item--' + timer.getID() + ' .timer-list-item__duration span');
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

module.exports = ViewTimers;

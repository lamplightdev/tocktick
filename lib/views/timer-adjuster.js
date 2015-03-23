'use strict';

var OverlayView = require("./overlay-view");
var Adjuster = require("./widgets/adjuster");


class ViewTimerAdjuster extends OverlayView {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'timer-adjuster',
        template: templates['timer-adjuster'],
        postOpen: () => {
          this.init();
          this.initDone();
        }
      },
    }, callbacks);

    this.elements = {
      durationValue: null,
      startValue: null,
      stopValue: null,
    };
  }

  init() {
    this._startAdjuster =
      new Adjuster(
        this.getContainer().querySelector('.timer-adjustment.timer-adjustment--start'),
        this._data.timer.getStartTime()
      );

    this._durationAdjuster =
      new Adjuster(
        this.getContainer().querySelector('.timer-adjustment.timer-adjustment--duration'),
        this._data.timer.getDuration()
      );

    this.elements.durationValue = document.querySelector('.timer-adjustment__duration span');
    this.elements.startValue = document.querySelector('.timer-adjustment__start span');
    this.elements.stopValue = document.querySelector('.timer-adjustment__stop span');

    this.onAnimationFrame();
  }

  onAnimationFrame() {
    this._startAdjuster.rotate();
    this._durationAdjuster.rotate();

    this._data.timer.start(this._startAdjuster.getCurrentValue(), true);
    this._data.timer.adjustDurationFromStart(this._durationAdjuster.getCurrentValue());

    this.elements.durationValue.textContent = this._data.timer.getFormattedDuration();
    this.elements.startValue.textContent = this._data.timer.getFormattedStartTime();
    this.elements.stopValue.textContent = this._data.timer.getFormattedStopTime();

    window.requestAnimationFrame((this.onAnimationFrame).bind(this));
  }

  initDone() {
    const done = this._container.querySelector('.timer-adjuster-done');

    done.addEventListener('click', () => {
      this.close();
    });
  }

}

module.exports = ViewTimerAdjuster;

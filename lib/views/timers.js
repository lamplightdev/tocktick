'use strict';

var View = require("./view");


class ViewTimers extends View {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'timers',
        template: templates.timers,
        postRender: (data) => {
          this.enableJSVersion();
          this.initTimerDurationUpdate(data);
          this.initTimerStop(data);
          this.initTimerUpdate(data);
          this.initTimerEdit(data);
          this.initTimerDelete(data);
          this.initTimerDetails();
        },
      },
    }, callbacks);
  }

  renderTimerItemEdit(timer, data) {
    this.renderElement('timer-list-item__edit--' + timer.getID(), 'timer-item-edit', timer, data);
  }

  initTimerDurationUpdate(data) {
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

      this.updateTimerDurations(timerData);
    }
  }

  updateTimerDurations(timerDatas) {
    for (let i=0; i<timerDatas.length; i++) {
      let timerData = timerDatas[i];

      var duration = timerData.timer.getDuration();
      if (timerData.timer.isRunning() && duration - timerData.lastDuration > 1000) {
        timerData.$el.textContent = timerData.timer.getFormattedDuration(true);
        timerData.lastDuration = duration;
      }
    }

    window.requestAnimationFrame((this.updateTimerDurations).bind(this, timerDatas));
  }

  initTimerStop(data) {
    console.log('initTimerStop');

    this.registerContainerEventListener('submit', (event) => {
      if (event.target.classList.contains('timer-list-item__actions__stop')) {
        event.preventDefault();

        const form = event.target;
        const timerID = form.dataset.timerId;

        if (data.grouped._timers.all[timerID]) {
          let timer = data.grouped._timers.all[timerID];

          this._callbacks.onTimerStopSubmit(timer);

          form.elements.actiontime.value = timer.getStopTime();

          this.submitForm(form).then((timerData) => {
            this._callbacks.onTimerStopResponse(timerData);
          });
        }
      }
    });
  }

  initTimerEdit(data) {
    console.log('initTimerEdit');

    this.registerContainerEventListener('submit', (event) => {
      if (event.target.classList.contains('timer-list-item__actions__edit')) {
        event.preventDefault();

        const form = event.target;
        const timerID = form.dataset.timerId;

        let allEdits = this._container.querySelectorAll('.timer-list-item__subactions');
        let forms = this._container.querySelectorAll('.timer-list-item__actions__edit');

        let subform = this._container.querySelector('.timer-list-item--' + timerID + ' .timer-list-item__subactions');
        if (subform.classList.contains('timer-list-item__subactions--show')) {
          subform.classList.remove('timer-list-item__subactions--show');
          form.classList.remove('timer-list-item__actions__edit--active');
          this._callbacks.onTimerEditClose(timerID);
        } else {
          for (let i=0; i<allEdits.length; i++) {
            allEdits[i].classList.remove('timer-list-item__subactions--show');
            forms[i].classList.remove('timer-list-item__actions__edit--active');
          }
          subform.classList.add('timer-list-item__subactions--show');
          form.classList.add('timer-list-item__actions__edit--active');
          this._callbacks.onTimerEditOpen(timerID);
        }
      }
    });
  }

  initTimerUpdate(data) {
    console.log('initTimerUpdate');

    this.registerContainerEventListener('submit', (event) => {
      if (event.target.classList.contains('timer-list-item__edit')) {
        event.preventDefault();

        const form = event.target;
        const timerID = form.dataset.timerId;

        if (data.grouped._timers.all[timerID]) {
          let timer = data.grouped._timers.all[timerID];

          this._callbacks.onTimerUpdateSubmit(timer, {
            description: form.elements.description.value,
            jobID: form.elements.jobid.value,
          });

          this.submitForm(form).then((timerData) => {
            this._callbacks.onTimerUpdateResponse(timerData);
          });
        }
      }
    });
  }

  initTimerDelete(data) {
    console.log('initTimerDelete');

    this.registerContainerEventListener('submit', (event) => {
      if (event.target.classList.contains('timer-list-item__delete')) {
        event.preventDefault();

        const form = event.target;
        const timerID = form.dataset.timerId;

        if (data.grouped._timers.all[timerID]) {
          let timer = data.grouped._timers.all[timerID];

          this._callbacks.onTimerDeleteSubmit(timer);

          this.submitForm(form).then((success) => {
            this._callbacks.onTimerDeleteResponse(success);
          });
        }
      }
    });
  }

  initTimerDetails(data) {
    console.log('initTimerDetails timers');

    this.registerContainerEventListener('click', (event) => {
      if (event.target.classList.contains('selectme')) {
        event.preventDefault();

        const timerID = event.target.dataset.timerId;
        if (this._callbacks.onTimerDetailsClick) {
          this._callbacks.onTimerDetailsClick(timerID, this._container.querySelector('.timers-timer-edit'));
        }
      }
    });
  }

}

module.exports = ViewTimers;

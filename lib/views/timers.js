'use strict';

var Handlebars = require("../../node_modules/handlebars/dist/handlebars.runtime");

var View = require("./view");


class ViewTimers extends View {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'timers',
        template: templates.timers,
        postRender: (data) => {
          this.initTimerDurationUpdate(data);
          this.initTimerStop(data);
          this.initTimerUpdate(data);
          this.initTimerEdit(data);
          this.initTimerDelete(data);
          this.initTimerJobEdit();
          this.initTimerTagsEdit(data);
          this.initTimerTimesEdit(data);
          this.initLoadMore();
        },
      },
    }, callbacks);

    this._timerDurationUpdateData = [];
  }

  renderTimerItemEdit(timer, data) {
    this.renderElement('timer-list-item__edit--' + timer.getID(), 'timer-item-edit', timer, data);
  }

  renderTimerItem(timer, data) {
    this.renderElement('timer-list-item--' + timer.getID(), 'timer-item', timer, data);
  }

  updateTimerDurationUpdateData(data) {
    this._timerDurationUpdateData = [];

    let timers = data.grouped.getCurrentTimers();

    if (timers.length) {
      for (let i=0 ; i<timers.length; i++) {
        this._timerDurationUpdateData.push({
          timer: timers[i],
          $el: this._container.querySelector('.timer-list-item--' + timers[i].getID() + ' .timer-list-item__timings__duration span'),
          lastDuration: 0
        });
      }
    }
  }

  initTimerDurationUpdate(data) {
    this.updateTimerDurationUpdateData(data);
    this.updateTimerDurations(this._timerDurationUpdateData);
  }

  updateTimerDurations() {
    for (let i=0; i<this._timerDurationUpdateData.length; i++) {
      let timerData = this._timerDurationUpdateData[i];

      if (timerData.$el) {
        var duration = timerData.timer.getDuration();
        if (timerData.timer.isRunning() && duration - timerData.lastDuration > 1000) {
          timerData.$el.textContent = timerData.timer.getFormattedDuration(true);
          timerData.lastDuration = duration;
        }
      }
    }

    window.requestAnimationFrame((this.updateTimerDurations).bind(this));
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

    this.registerContainerEventListener('click', (event) => {
      const edit = event.target.parentNode.parentNode;
      if (edit.classList.contains('timer-list-item__actions__edit')) {
        event.preventDefault();

        const timerID = edit.dataset.timerId;

        let allEdits = this._container.querySelectorAll('.timer-list-item__subactions');
        let forms = this._container.querySelectorAll('.timer-list-item__actions__edit');

        let subform = this._container.querySelector('.timer-list-item--' + timerID + ' .timer-list-item__subactions');
        if (subform.classList.contains('timer-list-item__subactions--show')) {
          subform.classList.remove('timer-list-item__subactions--show');
          edit.classList.remove('timer-list-item__actions__edit--active');
          this._callbacks.onTimerEditClose(timerID);
        } else {
          for (let i=0; i<allEdits.length; i++) {
            allEdits[i].classList.remove('timer-list-item__subactions--show');
            forms[i].classList.remove('timer-list-item__actions__edit--active');
          }
          subform.classList.add('timer-list-item__subactions--show');
          edit.classList.add('timer-list-item__actions__edit--active');
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

          const vars = this.serializeForm(form.elements);

          this._callbacks.onTimerUpdateSubmit(timer, {
            description: vars.description,
            jobID: vars.jobid,
          }, vars['tags[]']);

          this.updateTimerDurationUpdateData(data);

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

  initTimerJobEdit(data) {
    console.log('initTimerJobEdit timers');

    this.registerContainerEventListener('click', event => {
      if (event.target.classList.contains('selectme')) {
        event.preventDefault();

        const timerID = event.target.dataset.timerId;
        if (this._callbacks.onTimerJobClick) {
          this._callbacks.onTimerJobClick(timerID, this._container.querySelector('.timers-timer-job'));
        }
      }
    });
  }

  initTimerTagsEdit(data) {
    console.log('initTimerTagsEdit timers');

    this.registerContainerEventListener('click', event => {
      if (event.target.classList.contains('edittags')) {
        event.preventDefault();

        const timerID = event.target.dataset.timerId;
        if (this._callbacks.onTimerTagsClick) {
          this._callbacks.onTimerTagsClick(timerID, this._container.querySelector('.timers-timer-tags'));
        }
      }
    });
  }

  initTimerTimesEdit(data) {
    console.log('initTimerTimesEdit timers');

    this.registerContainerEventListener('click', event => {
      if (event.target.classList.contains('edittimes')) {
        event.preventDefault();

        const timerID = event.target.dataset.timerId;
        if (this._callbacks.onTimerTimesClick) {
          this._callbacks.onTimerTimesClick(timerID, this._container.querySelector('.timers-timer-times'));
        }
      }
    });
  }

  initLoadMore() {
    this.registerContainerEventListener('click', event => {
      if (event.target.classList.contains('timers-loadmore')) {
        event.preventDefault();
        this._callbacks.onLoadMore();

        console.log('load more');
      }
    });
  }

  loadMore(data) {
    var template = Handlebars.template(App.templates['timer-group']);
    let t = template(data);

    this._container.querySelector('.timers-history').insertAdjacentHTML('beforeend', t);
    this.updateTimerDurationUpdateData(data);
  }

}

module.exports = ViewTimers;

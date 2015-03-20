'use strict';

var View = require("./view");

var urlparse = require('url').parse;


class ViewNav extends View {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'nav-outer',
        template: templates['nav-outer'],
        postRender: (data) => {
          this.initTimerStart(data);
          this.initLinks();
        },
      },
      'nav': {
        name: 'nav',
        template: templates.nav,
        postRender: (data) => {
          //this.initLinks();
        },
      },
      'nav-timer': {
        name: 'nav-timer',
        template: templates['nav-timer'],
        postRender: (data) => {
          //this.initTimerStart(data);
        },
      },
    }, callbacks);
  }

  initLinks() {
    this.registerContainerEventListener('click', (event) => {
      if (typeof event.target.dataset.nav !== 'undefined') {
        event.preventDefault();

        this._callbacks.onLinkClicked(urlparse(event.target.href).pathname);
      }
    });
  }

  initTimerStart(data) {
    console.log('initTimerStart');

    this.registerContainerEventListener('submit', (event) => {
      if (event.target.classList.contains('nav-form-start')) {
        event.preventDefault();

        const form = event.target;

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
      }
    });
  }

}

module.exports = ViewNav;

'use strict';

var View = require("./view");

class ViewAccount extends View {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'account',
        template: templates.account,
        postRender: (data) => {
          this.initJobAdd(data);
          this.initTagAdd(data);
        },
      },
    }, callbacks);
  }

  initJobAdd(data) {
    console.log('initJobAdd');

    this.registerContainerEventListener('submit', (event) => {
      if (event.target.classList.contains('account__job-add')) {
        event.preventDefault();

        const form = event.target;

        let job = this._callbacks.onJobAddSubmit({
          name: form.elements.name.value,
        });

        form.dataset.apiAction += '/' + job.getID();

        this.submitForm(form).then(jobData => {
          this._callbacks.onJobAddResponse(jobData);
        });
      }
    });
  }

  initTagAdd(data) {
    console.log('initTagAdd');

    this.registerContainerEventListener('submit', (event) => {
      if (event.target.classList.contains('account__tag-add')) {
        event.preventDefault();

        const form = event.target;

        let tag = this._callbacks.onTagAddSubmit({
          name: form.elements.name.value,
        });

        form.dataset.apiAction += '/' + tag.getID();

        this.submitForm(form).then(tagData => {
          this._callbacks.onTagAddResponse(tagData);
        });
      }
    });
  }
}

module.exports = ViewAccount;

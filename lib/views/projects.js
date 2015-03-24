'use strict';

var View = require("./view");

class ViewProjects extends View {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'projects',
        template: templates.projects,
        postRender: (data) => {
          this.initJobAdd(data);
          this.initTagAdd(data);
          this.initJobDelete(data);
          this.initTagDelete(data);
        },
      },
    }, callbacks);
  }

  initJobAdd(data) {
    console.log('initJobAdd');

    this.registerContainerEventListener('submit', (event) => {
      if (event.target.classList.contains('projects__job-add')) {
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
      if (event.target.classList.contains('projects__tag-add')) {
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

  initJobDelete(data) {
    console.log('initJobDelete');

    this.registerContainerEventListener('submit', (event) => {
      if (event.target.classList.contains('projects__job-delete')) {
        event.preventDefault();

        const form = event.target;
        const jobID = form.dataset.jobId;

        if (data.grouped._jobs.all[jobID]) {
          let job = data.grouped._jobs.all[jobID];

          this._callbacks.onJobDeleteSubmit(job);

          this.submitForm(form).then((success) => {
            this._callbacks.onJobDeleteResponse(success);
          });
        }
      }
    });
  }

  initTagDelete(data) {
    console.log('initTagDelete');

    this.registerContainerEventListener('submit', (event) => {
      if (event.target.classList.contains('projects__tag-delete')) {
        event.preventDefault();

        const form = event.target;
        const tagID = form.dataset.tagId;

        if (data.grouped._tags.all[tagID]) {
          let tag = data.grouped._tags.all[tagID];

          this._callbacks.onTagDeleteSubmit(tag);

          this.submitForm(form).then((success) => {
            this._callbacks.onTagDeleteResponse(success);
          });
        }
      }
    });
  }

}

module.exports = ViewProjects;

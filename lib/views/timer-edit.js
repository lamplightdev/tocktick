'use strict';

var View = require("./view");

class ViewTimerEdit extends View {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'timer-edit',
        template: templates['timer-edit'],
        postRender: (data) => {
        },
      },
    }, callbacks);
  }

}

module.exports = ViewTimerEdit;

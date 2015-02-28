'use strict';

var View = require("./view");


class ViewTimers extends View {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'timers',
        template: templates.timers,
        postRender: (data) => {
        },
      },
    }, callbacks);
  }

}

module.exports = ViewTimers;

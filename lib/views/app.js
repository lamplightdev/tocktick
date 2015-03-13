'use strict';

var View = require("./view");


class ViewApp extends View {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'app',
        template: templates.app,
        postRender: (data) => {
        },
      },
    }, callbacks);
  }

}

module.exports = ViewApp;

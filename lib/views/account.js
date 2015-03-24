'use strict';

var View = require("./view");

class ViewAccount extends View {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'account',
        template: templates.account,
        postRender: (data) => {
        },
      },
    }, callbacks);
  }
}

module.exports = ViewAccount;

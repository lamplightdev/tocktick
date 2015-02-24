'use strict';

var View = require("./view");

class ViewAccount extends View {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'account',
        template: templates.account,
        postRender: () => {
        },
      },
    }, callbacks);
  }

}

module.exports = ViewAccount;

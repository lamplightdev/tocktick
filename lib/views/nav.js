'use strict';

var View = require("./view");

class ViewNav extends View {
  constructor(container, templates, callbacks) {
    super(container, {
      'all': {
        name: 'nav-outer',
        template: templates['nav-outer'],
        postRender: (data) => {
        },
      },
      'nav': {
        name: 'nav',
        template: templates.nav,
        postRender: (data) => {
        },
      },
      'nav-timer': {
        name: 'nav-timer',
        template: templates['nav-timer'],
        postRender: (data) => {
        },
      },
    }, callbacks);
  }

}

module.exports = ViewNav;
